# BioReactLab

BioReactLab is a comprehensive web application for managing and analyzing metabolic reactions in biological systems. The platform provides researchers and scientists with tools for chemical formula manipulation, metabolic pathway analysis, and reaction balancing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)


## Overview

The application combines a React-based frontend with a Django backend to provide:
- Chemical formula management with auto-completion and validation
- Metabolic reaction analysis and balancing
- Interactive molecular structure visualization
- Real-time formula validation and preview

## Prerequisites

- Python 3.11+
- Node.js 18.x+
- Conda (recommended for RDKit installation)

## Installation

### Backend Setup

```bash
# Create and activate conda environment
conda create -n bioreactlab python=3.11
conda activate bioreactlab

# Install RDKit
conda install -c conda-forge rdkit

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Project Structure
```
bioreactlab/
├── frontend/ # React frontend application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API services
│ │ └── styles/ # Global styles
│ └── public/ # Static assets
├── backend/ # Django backend application
│ ├── api/ # REST API endpoints
│ ├── metabolic/ # Metabolic processing logic
│ └── reactions/ # Reaction management
└── docs/ # Documentation
```

## Technology Stack

### Frontend
- React 18
- TypeScript
- Material-UI
- Vite
- OpenChemLib

### Backend
- Django 4.2
- Django REST Framework
- RDKit
- SQLite/PostgreSQL

## Development

### Running Tests

Backend Tests:
```bash
cd backend
python manage.py test
```

Frontend Tests:
```bash
cd frontend
npm run test
```

### Local Development

1. Start the backend server:
```bash
cd backend
python manage.py runserver
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## Deployment

The application uses GitHub Actions for CI/CD:
- Frontend is deployed to Netlify
- Backend is deployed to Railway

## 🚀 Deployment

The application is deployed on Netlify and can be accessed at:
[https://shimmering-alfajores-f7f968.netlify.app/](https://shimmering-alfajores-f7f968.netlify.app/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Project Link: [https://github.com/yourusername/bioreactlab](https://github.com/yourusername/bioreactlab)