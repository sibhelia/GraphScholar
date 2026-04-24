import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const GraphView = ({ data }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !data) return;

        // Vis.js Secenekleri (Premium Light Theme Icin)
        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: { size: 12, color: '#1e293b', face: 'Inter' }, // Koyu metin
                borderWidth: 2,
                shadow: { color: 'rgba(0,0,0,0.1)', size: 5, x: 2, y: 2 }
            },
            edges: {
                width: 1,
                color: { color: 'rgba(0, 0, 0, 0.15)', highlight: '#3b82f6' }, // Acik gri ve mavi
                smooth: { type: 'continuous' }
            },
            physics: {
                stabilization: false,
                barnesHut: {
                    gravitationalConstant: -2000,
                    springLength: 150,
                    springConstant: 0.04
                }
            },
            interaction: {
                hover: true,
                zoomView: true
            }
        };

        const network = new Network(containerRef.current, data, options);

        return () => network.destroy();
    }, [data]);

    return (
        <div className="graph-area">
            <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
            
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                display: 'flex',
                gap: '1rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} /> Makale
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8b5cf6' }} /> Kavram
                </div>
            </div>
        </div>
    );
};

export default GraphView;
