# BioReactLab

BioReactLab is a comprehensive web application for managing and analyzing metabolic reactions in biological systems. The platform provides researchers and scientists with tools for chemical formula manipulation, metabolic pathway analysis, and reaction balancing.

[![Build Status](https://github.com/yourusername/bioreactlab/workflows/Deploy%20Full%20Stack%20Application/badge.svg)](https://github.com/yourusername/bioreactlab/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/yourusername/bioreactlab](https://github.com/yourusername/bioreactlab)