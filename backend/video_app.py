# video_app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import os
import boto3
import pymysql
import re
import os
import time
import boto3
import requests
import google.generativeai as genai
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

#AWS Configuration
S3_BUCKET = "awstranscriptbucket-01"
S3_AUDIO_FOLDER = "audiofiles/"
S3_REPORTS_FOLDER = "reports/"
S3_PDF_FOLDER = "med_pdf/"  # Folder for uploading PDFs
REGION = "us-east-1"

s3 = boto3.client("s3", region_name=REGION)
transcribe = boto3.client("transcribe", region_name=REGION)

DB_CONFIG = {
    "host": "medscribe.ch2muisakmzj.us-east-1.rds.amazonaws.com",  # Replace with AWS RDS Endpoint
    "user": "admin",
    "password": "medscribe2025",
    "database": "medscribe_db",
    "port": 3306
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)


# Configure Gemini AI
genai.configure(api_key="AIzaSyAJhYD2ceqiLtluCUIR-6xH6r8cbj6Sl4I")  # Replace with actual API key

def process_transcription_pipeline():
    """Processes the latest audio file from S3, transcribes it, generates a medical report, and uploads the report & PDF to S3."""

    def get_latest_s3_file(folder):
        """Fetches the most recent file from a specified S3 folder."""
        response = s3.list_objects_v2(Bucket=S3_BUCKET, Prefix=folder)
        if "Contents" not in response:
            return None  # No files found in folder
        latest_file = max(response["Contents"], key=lambda x: x["LastModified"])
        return latest_file["Key"]  # Return file path

    def transcribe_audio(audio_filename):
        """Starts AWS Transcribe job and returns the transcript."""
        transcription_job_name = os.path.splitext(audio_filename)[0]
        file_extension = os.path.splitext(audio_filename)[1].lower().replace(".", "")  # Get format

        supported_formats = {"mp3", "mp4", "wav", "flac", "webm"}
        if file_extension not in supported_formats:
            print(f"❌ Unsupported format '{file_extension}'. AWS Transcribe only supports {supported_formats}.")
            exit()

        s3_uri = f"s3://{S3_BUCKET}/{S3_AUDIO_FOLDER}{audio_filename}"
        print(f"🔹 Using S3 URI: {s3_uri} for Transcription")

        transcribe.start_transcription_job(
            TranscriptionJobName=transcription_job_name,
            Media={"MediaFileUri": s3_uri},
            MediaFormat=file_extension,
            LanguageCode="en-US",
        )

        while True:
            response = transcribe.get_transcription_job(TranscriptionJobName=transcription_job_name)
            status = response["TranscriptionJob"]["TranscriptionJobStatus"]
            if status == "COMPLETED":
                transcript_url = response["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
                break
            elif status == "FAILED":
                return {"error": "Transcription job failed!"}
            print("⏳ Waiting for transcription to complete...")
            time.sleep(10)

        transcript_text = requests.get(transcript_url).json()["results"]["transcripts"][0]["transcript"]
        return {"success": "Transcription completed", "transcript_text": transcript_text, "job_name": transcription_job_name}

    def generate_medical_report(transcript_text, job_name):
        """Uses Gemini AI to generate a structured medical report."""
        prompt = f"""
        Analyze the following doctor-patient conversation and generate a structured medical report:
        ( In case of lack of information dont assume any hallucinations just leave the section empty )
        ---
        {transcript_text}
        ---
        ### Output Format:
        - **Title**: Short summary of the consultation.
        - **Description**: Detailed summary of discussion.
        - **Medical Conditions**: Diagnosed conditions.
        - **Suggestions and Medications**: Recommended treatment.
        - **Results**: Any test results or findings.
        - **Overall Summary**: Final conclusion from the doctor.
        """

        model = genai.GenerativeModel("gemini-2.0-pro-exp-02-05")
        response = model.generate_content(prompt)
        report_data = response.text

        report_txt_filename = f"{job_name}_report.txt"
        local_txt_path = os.path.join("reports", report_txt_filename)

        os.makedirs("reports", exist_ok=True)
        with open(local_txt_path, "w", encoding="utf-8") as file:
            file.write(report_data)

        return {"success": "Report generated", "report_path": local_txt_path, "report_filename": report_txt_filename}

    def generate_pdf_from_text(input_txt, output_pdf):
        """Generates a well-structured PDF report with pastel colors."""
        with open(input_txt, "r", encoding="utf-8") as file:
            text_content = file.read()

        doc = SimpleDocTemplate(output_pdf, pagesize=A4)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], fontSize=18, textColor=colors.darkblue, spaceAfter=14, alignment=1)
        section_style = ParagraphStyle("SectionStyle", parent=styles["Heading2"], fontSize=14, textColor=colors.black, spaceAfter=10, bold=True, underline=True)
        content_style = ParagraphStyle("ContentStyle", parent=styles["Normal"], fontSize=11, spaceAfter=12, leading=14)

        elements = [Paragraph("Visit Summary Report", title_style), Spacer(1, 12)]
        pastel_colors = [colors.lightblue, colors.lightpink, colors.lightgreen, colors.lightyellow, colors.lightgrey]

        sections = text_content.split("\n\n")  # Split sections based on blank lines
        for i, section in enumerate(sections):
            if ": " in section:
                header, content = section.split(": ", 1)
                elements.append(HRFlowable(width="100%", thickness=2, lineCap='round', color=pastel_colors[i % len(pastel_colors)], spaceBefore=10, spaceAfter=10))
                elements.append(Paragraph(header, section_style))
                elements.append(Spacer(1, 6))
                elements.append(Paragraph(content.replace("*", "•").replace("\n", "<br/>"), content_style))
                elements.append(Spacer(1, 12))

        doc.build(elements)
        print(f"✅ PDF successfully generated: {output_pdf}")

    # Step 1: Get latest audio file
    latest_audio = get_latest_s3_file(S3_AUDIO_FOLDER)
    if not latest_audio:
        print("❌ No audio files found in S3!")
        exit()

    audio_filename = os.path.basename(latest_audio)
    
    # Step 2: Transcribe audio
    transcription = transcribe_audio(audio_filename)
    transcript_text = transcription["transcript_text"]
    job_name = transcription["job_name"]

    # Step 3: Generate reports
    report = generate_medical_report(transcript_text, job_name)
    pdf_filename = f"{job_name}_report.pdf"
    generate_pdf_from_text(report["report_path"], pdf_filename)

    # Step 4: Upload reports to S3
    s3.upload_file(report["report_path"], S3_BUCKET, f"{S3_REPORTS_FOLDER}{report['report_filename']}")
    s3.upload_file(pdf_filename, S3_BUCKET, f"{S3_PDF_FOLDER}{pdf_filename}")

    s3_key = f"{S3_PDF_FOLDER}{pdf_filename}"
    print(s3_key)
    s3.upload_file(pdf_filename, S3_BUCKET, s3_key)
    s3_url = f"https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{s3_key}"

    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO file (name, url, type) VALUES (%s, %s, %s)"
    cursor.execute(query, (pdf_filename, s3_url , "pdf"))
    connection.commit()
    connection.close()
    # Get the file_id of the inserted file
    file_id = cursor.lastrowid
    print("\n🎉 Process Completed Successfully!")
    return file_id
    


@app.route('/save-audio', methods=['POST'])
def save_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    # start_timestamp = request.form.get('startTimestamp')
    # end_timestamp = request.form.get('endTimestamp')
    
    # start_timestamp = datetime.datetime.fromtimestamp(start_timestamp / 1000)
    # end_timestamp = datetime.datetime.fromtimestamp(end_timestamp / 1000)
    # print(start_timestamp)
    # print(end_timestamp)
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    webm_filename = os.path.join(UPLOAD_FOLDER, f'conversation_{timestamp}.webm')
    audio_file.save(webm_filename)
    print(f"Audio recording saved to {webm_filename}")
    

    # Upload to S3
    s3_key = f"{S3_AUDIO_FOLDER}{webm_filename.split('/')[1]}"
    print(s3_key)
    s3.upload_file(webm_filename, S3_BUCKET, s3_key)
    s3_url = f"https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{s3_key}"
    # Step 1: Insert file info into the `file` table
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO file (name, url, type) VALUES (%s, %s, %s)"
    cursor.execute(query, (webm_filename, s3_url, audio_file.content_type))

    # Get the file_id of the inserted file
    file_id = cursor.lastrowid

    # Step 2: Insert a consultation entry
    # You will need to pass the patient_id, doctor_id, start_time, and end_time for the consultation
    # For example, let's assume you send these details as part of the request.
    
    patient_id = "1"
    doctor_id = "1"
    start_time = 0 # start_timestamp
    end_time = 0 # end_timestamp
    status = "Completed"  # e.g., "Active", "Completed", "Cancelled"
    
    # Insert consultation record
    

    # ✅ Call Function Automatically for Latest Audio Processing
    report_file_id = process_transcription_pipeline()

    consultation_query = """INSERT INTO consultation (patient_id, doctor_id, start_time, end_time, status, ufile_id, rfile_id) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s)"""
    cursor.execute(consultation_query, (patient_id, doctor_id, start_time, end_time, status, file_id, report_file_id))

    connection.commit()
    connection.close()

    return jsonify({"message": "Audio file uploaded successfully!", "s3_url": s3_url}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)