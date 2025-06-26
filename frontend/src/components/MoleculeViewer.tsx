import React, { useState, useEffect } from 'react';
// @ts-ignore
import OCL from 'openchemlib/full';

// KetcherViewer component props
interface MoleculeViewerProps {
    smiles?: string;
    width?: number;
    height?: number;
    title?: string;
    showStatus?: boolean;
}

// Ketcher-based molecule viewer (read-only)
export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
    smiles,
    width = 200,
    height = 150,
    title,
    showStatus = true
}) => {
    const [svgContent, setSvgContent] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        if (!smiles) return;
        try {
            const mol = OCL.Molecule.fromSmiles(smiles);
            const svg = mol.toSVG(width, height, 'white');
            setSvgContent(svg);
            setStatus('Molecule rendered successfully');
        } catch (error) {
            setStatus('Failed to render molecule');
        }
    }, [smiles, width, height]);

    if (!smiles) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {title && <div style={{ marginBottom: 4, color: '#888', fontSize: 14 }}>{title}</div>}
            <div
                style={{
                    width,
                    height,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: '#fff'
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            {showStatus && (
                <div style={{ marginTop: 4, fontSize: 12, color: status.includes('success') ? '#4caf50' : '#f44336' }}>
                    {status}
                </div>
            )}
        </div>
    );
}; 