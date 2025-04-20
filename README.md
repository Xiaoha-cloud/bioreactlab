# BioReactLab

BioReactLab is a comprehensive web application for managing and analyzing metabolic reactions in biological systems. The platform provides researchers and scientists with tools for chemical formula manipulation, metabolic pathway analysis, and reaction balancing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)](https://mui.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)](https://www.netlify.com/)

## Overview

The application combines a React-based frontend with a Django backend to provide:
- Chemical formula management with auto-completion and validation
- Metabolic reaction analysis and balancing
- Interactive molecular structure visualization
- Real-time formula validation and preview


The application is deployed on Netlify and can be accessed at:
[https://shimmering-alfajores-f7f968.netlify.app/](https://shimmering-alfajores-f7f968.netlify.app/)

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


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Project Link: [https://github.com/yourusername/bioreactlab](https://github.com/yourusername/bioreactlab)