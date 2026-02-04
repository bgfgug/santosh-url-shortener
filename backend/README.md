🐍 Backend Setup Guide
A clear guide to setting up the Python development environment for this project.
🛠 Prerequisites
Python 3.8+
Verify your version:

python --version


🚀 Getting Started
1. Initialize Virtual Environment
Navigate to the backend/ directory and create a virtual environment to isolate project dependencies 1.4.4, 1.5.9.


python -m venv venv


2. Activate Environment
Activation commands vary by your operating system 1.4.5:
Platform	Shell	Command

Windows	Git Bash	source venv/Scripts/activate

Windows	PowerShell	.\venv\Scripts\Activate.ps1

macOS / Linux	Terminal	source venv/bin/activate

Note: When active, your terminal should show (venv) at the start of the line.

3. Install Dependencies

Once the environment is active, install all required packages from requirements.txt 1.5.5:


pip install -r requirements.txt


4. Database & Server
Prepare the database and launch the local development server:


python manage.py migrate
python manage.py runserver


