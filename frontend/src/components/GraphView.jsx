import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { FileText, X, ExternalLink, Hash, Users, Zap, Filter, MousePointer2, GitBranch } from 'lucide-react';

const GraphView = ({ data }) => {
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [filterYear, setFilterYear] = useState('all');
    const [pathfinderNodes, setPathfinderNodes] = useState([]);
    const [isPathfinderActive, setIsPathfinderActive] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !data) return;

        const visData = {
            nodes: new DataSet(data.nodes),
            edges: new DataSet(data.edges)
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 20,
                font: { size: 12, face: 'Segoe UI', color: '#1e293b' },
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 5, x: 2, y: 2 }
            },
            edges: {
                width: 1,
                color: { color: '#cbd5e1', highlight: 'var(--accent-primary)', hover: 'var(--accent-primary)' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                smooth: { type: 'continuous' }
            },
            physics: {
                enabled: true,
                barnesHut: { gravitationalConstant: -3000, springLength: 150, springConstant: 0.04 },
                stabilization: { iterations: 150 }
            },
            interaction: { hover: true, multiselect: true }
        };

        const network = new Network(containerRef.current, visData, options);

        network.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const nodeData = data.nodes.find(n => n.id === nodeId);
                
                if (isPathfinderActive) {
                    setPathfinderNodes(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId].slice(-2));
                } else {
                    setSelectedNode(nodeData);
                }
            } else {
                setSelectedNode(null);
            }
        });

        return () => network.destroy();
    }, [data, isPathfinderActive]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-main)' }}>
            {/* Üst Filtre Paneli */}
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px' }}>
                    <Filter size={14} color="var(--text-secondary)" />
                    <span style={{ fontWeight: '600' }}>Filtrele:</span>
                </div>
                
                <select 
                    style={filterSelectStyle}
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                >
                    <option value="all">Tüm Yıllar</option>
                    <option value="2024">2024 Sonrası</option>
                    <option value="2020">2020 Sonrası</option>
                </select>

                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>

                <button 
                    onClick={() => setIsPathfinderActive(!isPathfinderActive)}
                    style={{
                        ...filterSelectStyle,
                        backgroundColor: isPathfinderActive ? 'var(--accent-light)' : 'transparent',
                        color: isPathfinderActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                    }}
                >
                    <GitBranch size={14} />
                    Yol Bulucu (Pathfinder) {pathfinderNodes.length > 0 && `(${pathfinderNodes.length}/2)`}
                </button>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
                {/* Ana Grafik Alani */}
                <div ref={containerRef} style={{ flex: 1, height: '100%' }} />

                {/* Efsane (Legend) */}
                <div style={legendStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#3b82f6' }} /> Makale
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} /> Kavram
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> Yazar
                    </div>
                </div>

                {/* Sag Panel: Makale/Düğüm Detayları */}
                {selectedNode && (
                    <div className="graph-sidebar" style={sidebarStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '4px 8px', backgroundColor: 'var(--accent-light)', borderRadius: '4px', fontSize: '10px', color: 'var(--accent-primary)', fontWeight: '700' }}>
                                {selectedNode.label.toUpperCase()}
                            </div>
                            <X size={18} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setSelectedNode(null)} />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            {selectedNode.label}
                        </h3>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                            <section style={{ marginBottom: '1.5rem' }}>
                                <div style={sectionTitleStyle}><Zap size={14} /> LLM Çıkarımı</div>
                                <p style={sectionTextStyle}>
                                    Bu çalışma, {selectedNode.label} ekseninde literatürdeki metodolojik boşluğu kapatmayı hedeflemektedir. 
                                    Özellikle atıf zincirindeki konumu, çalışmanın temel bir referans noktası olduğunu kanıtlamaktadır.
                                </p>
                            </section>

                            <section style={{ marginBottom: '1.5rem' }}>
                                <div style={sectionTitleStyle}><Users size={14} /> Atıf ve Etki</div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                                    <div style={badgeStyle}><Hash size={12} /> 24 Atıf</div>
                                    <div style={badgeStyle}>H-Index: 12</div>
                                </div>
                            </section>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary" style={{ flex: 1, padding: '8px' }}>
                                <ExternalLink size={14} style={{ marginRight: '6px' }} /> PDF Oku
                            </button>
                            <button style={{ ...btnSecondaryStyle, padding: '8px' }}>
                                <Share2 size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .graph-sidebar {
                    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

const filterSelectStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    outline: 'none',
    color: 'var(--text-primary)'
};

const legendStyle = {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    zIndex: 5
};

const sidebarStyle = {
    width: '340px',
    height: '100%',
    backgroundColor: '#fff',
    borderLeft: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-5px 0 20px rgba(0,0,0,0.03)',
    zIndex: 100
};

const sectionTitleStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const sectionTextStyle = {
    fontSize: '13px',
    lineHeight: '1.6',
    color: 'var(--text-secondary)'
};

const badgeStyle = {
    padding: '4px 8px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: '4px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
};

const btnSecondaryStyle = {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
};

export default GraphView;

