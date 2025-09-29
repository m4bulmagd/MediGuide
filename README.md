# MediGuide

MediGuide is an accessibility-first application designed to empower blind and low-vision individuals to manage their medications with unparalleled confidence and independence. By combining intelligent image recognition, a voice-first interface, and a secure medication verification system, MediGuide eliminates guesswork and prevents common errors like taking the wrong drug or an incorrect dose.

## Project Structure

The project is divided into two main parts:

-   `frontend`: A React application built with Vite that provides the user interface.
-   `backend`: An AWS CDK application that defines the serverless backend infrastructure.

## Setup and Installation

### Frontend

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Backend

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Deploy the CDK stack:**
    ```bash
    npx cdk deploy
    ```

## Building for Production

To build the frontend for production as a static website, follow these steps:

1.  **Navigate to the frontend directory.**

2.  **Run the build command:**
    ```bash
    npm run build
    ```

    This will create a `dist` directory containing the static assets.

3.  **Deploy to S3:**

    The contents of the `dist` directory can be uploaded to an S3 bucket configured for static website hosting. The backend CDK stack includes an S3 bucket for this purpose. You can use the AWS CLI to sync the `dist` directory with the S3 bucket:

    ```bash
    aws s3 sync dist/ s3://<your-s3-bucket-name>
    ```

    Replace `<your-s3-bucket-name>` with the name of the S3 bucket created by the CDK stack.