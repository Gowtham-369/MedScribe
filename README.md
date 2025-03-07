# MedScribe - RevUC2025

## Overview
MedScribe is a healthcare web application designed to enhance doctor-patient interactions through AI-powered transcription, report generation, and seamless communication. 
The platform enables:

- **Two-way chat and video calls** between doctors and patients, as well as doctor-to-doctor communication ( Proposed Not Yet Implemented this Feature ) .
- **Speech-to-text transcription** during video conversations.
- **AI-based text enhancement** for grammatical corrections.
- **Automated report generation** using Gemini API, including:
  - Title
  - Description
  - Medical Conditions
  - Suggestions and Medications
  - Results
  - Overall Summary
- **Doctor approval workflow** before finalizing reports . ( For Our First MVP - working prototype, we haven't implemented this Feature )
- **Secure storage** of medical data for each consultation.

## Features
### 1. **Chat & Video Calls**
- Real-time doctor-patient and doctor-to-doctor communication.
- Secure and HIPAA-compliant video calls.

### 2. **Speech-to-Text Transcription**
- Live transcription of consultations.
- Improved accuracy using AI-driven models.

### 3. **AI-Powered Report Generation**
- Automatic generation of structured medical reports.
- Editable reports for doctor validation.
- AI-generated medical suggestions.

### 4. **Data Security & Compliance**
- Secure storage of medical history, medications, and user details.
- Role-based access to sensitive information.
- Encryption of stored medical data.

## Technology Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Websocket(Socket.io), Node.js, Flask, Python, Boto3 (AWS SDK)
- **Database**: AWS RDS 
- **AI Services**: Gemini API (for report generation)
- **Speech-to-Text**: AWS Transcribe for speech to text
- **Video Calls**: WebRTC & Peer.js
- **Authentication**: Basic Password based authentication
- **Storage**: AWS S3 (for transcripts and reports)

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (>=16.x)
- Python (>=3.9)
- AWS account with S3 and Transcribe access

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/Gowtham-369/MedScribe.git
   cd medscribe-revuc2025
   ```
2. Navigate to the backend directory and Install dependencies:
   ``` sh
   pip install requirments.txt file
   ```
3. Set up environment variables in a `.env` file:
   ```sh
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the backend server apps chat_app.py and video_app.py:
   ``` sh
   cd backend
   python3 video_app.py
   python3 chat_app.py
   ``` 
5. Navigate to the frontend directory and start the client:
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

## Usage
- Sign up or log in as a **doctor** or **patient**.
- Start a consultation via **chat** or **video call**.
- View **transcribed conversation** in real-time.
- Generate and AI-powered **medical reports**.
- Securely store and retrieve past consultations.

## Roadmap
- [ ] Integration with Apple HealthKit
- [ ] Implement multilingual transcription
- [ ] Deploy on AWS/GCP
- [ ] Mobile app version

## Thanks to all Sponsors and Judges ! 

