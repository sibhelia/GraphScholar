import { useEffect, useRef, useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { ExternalLink, Filter, GitBranch, Share2, Sparkles, X, Layers, Maximize2, ZoomIn, Info } from 'lucide-react';

const GraphView = ({ data, papers = [], onSeed, isSeeding }) => {
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [filterYear, setFilterYear] = useState('all');
    const [isPathfinderActive, setIsPathfinderActive] = useState(false);
    const [pathfinderNodes, setPathfinderNodes] = useState([]);

    const threshold = filterYear === 'all' ? null : Number(filterYear);
    const filteredNodes = (data?.nodes || []).filter((node) => {
        if (!threshold) return true;
        if (!node.year) return node.group !== 'paper';
        return Number(node.year) >= threshold;
    });
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredEdges = (data?.edges || []).filter(
        (edge) => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to),
    );

    useEffect(() => {
        if (!containerRef.current) return;

        const visData = {
            nodes: new DataSet(
                filteredNodes.map((node) => {
                    const isPathSelected = pathfinderNodes.includes(node.id);
                    return {
                        ...node,
                        color: getNodeColor(node.group),
                        shape: (node.group === 'concept' || node.group === 'Author') ? 'dot' : 'box',
                        borderWidth: isPathSelected ? 4 : 2,
                        borderColor: isPathSelected ? '#6366f1' : undefined,
                        font: { color: '#0f172a', face: 'Inter, system-ui', size: 14, weight: '600' },
                        margin: node.group === 'paper' ? 12 : 8,
                        shadow: { enabled: true, color: isPathSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(0,0,0,0.05)', size: isPathSelected ? 20 : 10, x: 0, y: 4 }
                    };
                }),
            ),
            edges: new DataSet(
                filteredEdges.map((edge) => {
                    const edgeColor = getEdgeColor(edge.label);
                    return {
                        ...edge,
                        color: edgeColor,
                        width: edge.label === 'CITES' ? 2 : 1.5,
                        selectionWidth: 3,
                        hoverWidth: 2.5,
                        smooth: { type: 'continuous', roundness: 0.5 },
                        font: { size: 0 },  // kenar etiketlerini gizle (legend var)
                    };
                }),
            ),
        };

        const options = {
            autoResize: true,
            nodes: {
                scaling: { min: 10, max: 30 },
            },
            edges: {
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                selectionWidth: 2,
            },
            physics: {
                enabled: true,
                barnesHut: { 
                    gravitationalConstant: -3000, 
                    springLength: 180, 
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.2
                },
                stabilization: { iterations: 150 },
            },
            interaction: { 
                hover: true, 
                multiselect: false, 
                navigationButtons: false,
                tooltipDelay: 200
            },
        };

        const network = new Network(containerRef.current, visData, options);

        network.on('click', (params) => {
            if (params.nodes.length === 0) {
                setSelectedNode(null);
                return;
            }

            const nodeId = params.nodes[0];
            const nodeData = filteredNodes.find((node) => node.id === nodeId);

            if (isPathfinderActive) {
                const newPathNodes = prev => 
                    prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId].slice(-2);
                
                setPathfinderNodes((prev) => {
                    const next = prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId].slice(-2);
                    
                    if (next.length === 2) {
                        // Backend'den yolu sorgula
                        fetch(`http://localhost:8080/graph/path?start=${next[0]}&end=${next[1]}`)
                            .then(res => res.json())
                            .then(pathData => {
                                if (pathData.nodes && pathData.nodes.length > 0) {
                                    const pathIds = new Set(pathData.nodes.map(n => n.id));
                                    const pathEdgeIds = new Set(pathData.edges.map(e => e.id));
                                    
                                    // Grafa vurgu ekle
                                    visData.nodes.update(pathData.nodes.map(n => ({
                                        id: n.id,
                                        borderWidth: 4,
                                        shadow: { enabled: true, color: '#8b5cf6', size: 15 }
                                    })));
                                } else {
                                    alert("Bu iki düğüm arasında bir bağlantı bulunamadı.");
                                }
                            });
                    }
                    return next;
                });
            } else {
                setSelectedNode(nodeData || null);
            }
        });

        return () => network.destroy();
    }, [filteredEdges, filteredNodes, isPathfinderActive]);

    const selectedPaper = papers.find(
        (paper) => paper.id === selectedNode?.id || paper.title === selectedNode?.label,
    );

    return (
        <section className="page-scroll page-graph" style={{ padding: '24px' }}>
            <div className="graph-header-shell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div className="eyebrow" style={{ color: '#6366f1' }}>BİLGİ TOPOLOJİSİ</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>Semantik Varlıklar</h2>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '8px' }}>Atıf yollarını izle, kavram kümelerini incele ve ilişkisel bağlamı görselleştir.</p>
                </div>

                <div className="graph-toolbar" style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <Filter size={14} style={{ color: '#94a3b8' }} />
                        <select 
                            value={filterYear} 
                            onChange={(e) => setFilterYear(e.target.value)}
                            style={{ border: 'none', fontSize: '0.85rem', fontWeight: '600', color: '#475569', outline: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <option value="all">Tüm Dönemler</option>
                            <option value="2024">2024+</option>
                            <option value="2020">2020+</option>
                        </select>
                    </div>
                    <button
                        onClick={onSeed}
                        disabled={isSeeding}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', cursor: isSeeding ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                            background: isSeeding ? '#f1f5f9' : '#eff6ff',
                            color: isSeeding ? '#94a3b8' : '#1d4ed8',
                            border: `1px solid ${isSeeding ? '#e2e8f0' : '#dbeafe'}`,
                            boxShadow: isSeeding ? 'none' : '0 2px 8px rgba(29, 78, 216, 0.05)'
                        }}
                    >
                        {isSeeding ? (
                            <>
                                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                İşleniyor...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Akademik Küme Ekle
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setIsPathfinderActive(!isPathfinderActive)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                            background: isPathfinderActive ? '#6366f1' : '#fff',
                            color: isPathfinderActive ? '#fff' : '#475569',
                            border: `1px solid ${isPathfinderActive ? '#6366f1' : '#e2e8f0'}`,
                            boxShadow: isPathfinderActive ? '0 8px 16px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                    >
                        <GitBranch size={16} />
                        Yol Bulucu {pathfinderNodes.length > 0 ? `(${pathfinderNodes.length}/2)` : ''}
                    </button>
                </div>
            </div>

            <div className="graph-view-container" style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0 }}>
                <div className="graph-canvas-shell" style={{ width: '100%', height: '100%', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div className="graph-summary-strip" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={14} style={{ color: '#6366f1' }} />
                                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{filteredNodes.length}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Varlık</span>
                            </div>
                            <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Share2 size={14} style={{ color: '#10b981' }} />
                                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{filteredEdges.length}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>İlişki</span>
                            </div>
                        </div>
                        {!selectedNode && (
                            <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={14} /> Detaylar için bir düğüme tıkla
                            </div>
                        )}
                    </div>

                    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                    <div className="graph-controls" style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}><ZoomIn size={18} /></button>
                        <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}><Maximize2 size={18} /></button>
                    </div>

                    <div className="graph-legend" style={{
                        position: 'absolute', bottom: '20px', left: '20px',
                        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
                        padding: '14px 18px', borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px'
                    }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                            Düğüm Türleri
                        </span>

                        {[
                            { label: 'Makale', color: '#3b82f6', bg: '#eff6ff', shape: '4px', count: filteredNodes.filter(n => n.group === 'paper').length, desc: 'Bilimsel yayın' },
                            { label: 'Yazar', color: '#8b5cf6', bg: '#f5f3ff', shape: '50%', count: filteredNodes.filter(n => n.group === 'Author').length, desc: 'Araştırmacı' },
                            { label: 'Kavram', color: '#f59e0b', bg: '#fffbeb', shape: '50%', count: filteredNodes.filter(n => n.group === 'concept').length, desc: 'Semantik etiket' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '14px', height: '14px', flexShrink: 0,
                                    background: item.bg, border: `2.5px solid ${item.color}`,
                                    borderRadius: item.shape,
                                    boxShadow: `0 0 0 3px ${item.color}20`
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>{item.label}</span>
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: '800', color: item.color,
                                            background: item.bg, padding: '1px 7px', borderRadius: '20px',
                                            border: `1px solid ${item.color}40`
                                        }}>{item.count}</span>
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500' }}>{item.desc}</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {[
                                { label: 'CITES', color: '#64748b', desc: 'Atıf ilişkisi' },
                                { label: 'WROTE', color: '#8b5cf6', desc: 'Yazarlık bağı' },
                                { label: 'MENTIONS', color: '#f59e0b', desc: 'Kavram bağı' },
                            ].map(edge => (
                                <div key={edge.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '20px', height: '2px', background: edge.color, borderRadius: '2px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                                        <span style={{ color: edge.color, fontWeight: '800' }}>{edge.label}</span> — {edge.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Overlaid Slide-out Detail Panel */}
                {selectedNode && (
                    <aside className="graph-side-panel" style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '20px', 
                        bottom: '20px', 
                        width: '380px', 
                        zIndex: 100, 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '24px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden', 
                        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)',
                        animation: 'panelSlideIn 0.3s ease-out'
                    }}>
                        <div style={{ padding: '24px', background: selectedNode.group === 'concept' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                            <button 
                                onClick={() => setSelectedNode(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: '#fff', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            >
                                <X size={16} />
                            </button>
                            <span style={{ 
                                fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '8px', background: '#fff', color: selectedNode.group === 'concept' ? '#b45309' : '#1d4ed8', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', display: 'inline-block', marginBottom: '12px'
                            }}>
                                {selectedNode.group === 'concept' ? 'Akademik Kavram' : 'Bilimsel Makale'}
                            </span>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>{selectedNode.label}</h3>
                        </div>

                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Dönem</span>
                                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{selectedPaper?.year || selectedNode.year || '2024'}</strong>
                                </div>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Atıf</span>
                                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{selectedNode.citations || '12+'}</strong>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} style={{ color: '#6366f1' }} /> Özet ve Bağlam
                                </h4>
                                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6' }}>
                                    {selectedPaper?.abstract || 'Bu düğüm, kütüphanenizdeki makalelerden çıkarılan önemli bir semantik varlığı temsil ediyor. Diğer kavramlarla olan bağları graf üzerinden incelenebilir.'}
                                </p>
                            </div>

                            {selectedPaper?.concepts?.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '800', marginBottom: '10px' }}>İlişkili Etiketler</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {selectedPaper.concepts.map((concept) => (
                                            <span key={concept} style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6366f1', background: '#eef2ff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e0e7ff' }}>{concept}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <ExternalLink size={14} /> Kaynak
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <Share2 size={14} /> Paylaş
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </section>
    );
};

function getNodeColor(group) {
    if (group === 'concept') {
        return {
            background: '#fffbeb',
            border: '#f59e0b',
            highlight: { background: '#fef3c7', border: '#d97706' },
            hover: { background: '#fef3c7', border: '#d97706' }
        };
    }
    if (group === 'Author') {
        return {
            background: '#f5f3ff',
            border: '#8b5cf6',
            highlight: { background: '#ede9fe', border: '#7c3aed' },
            hover: { background: '#ede9fe', border: '#7c3aed' }
        };
    }
    return {
        background: '#eff6ff',
        border: '#3b82f6',
        highlight: { background: '#dbeafe', border: '#1d4ed8' },
        hover: { background: '#dbeafe', border: '#1d4ed8' }
    };
}

function getEdgeColor(label) {
    if (label === 'WROTE') {
        return { color: '#c4b5fd', hover: '#8b5cf6', highlight: '#8b5cf6', opacity: 0.8 };
    }
    if (label === 'MENTIONS') {
        return { color: '#fcd34d', hover: '#f59e0b', highlight: '#f59e0b', opacity: 0.8 };
    }
    // CITES
    return { color: '#cbd5e1', hover: '#64748b', highlight: '#475569', opacity: 0.9 };
}

export default GraphView;
