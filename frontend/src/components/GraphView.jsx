import { useEffect, useRef, useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { ExternalLink, Filter, GitBranch, Share2, Sparkles, X } from 'lucide-react';

const GraphView = ({ data, papers = [] }) => {
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
                filteredNodes.map((node) => ({
                    ...node,
                    color: getNodeColor(node.group),
                    shape: node.group === 'concept' ? 'dot' : 'box',
                    borderWidth: 1.5,
                    font: { color: '#2d1f4f', face: 'Aptos', size: 13 },
                    margin: node.group === 'paper' ? 10 : 6,
                })),
            ),
            edges: new DataSet(
                filteredEdges.map((edge) => ({
                    ...edge,
                    color: { color: '#d4c4f7', hover: '#8b5cf6', highlight: '#8b5cf6' },
                    width: 1.2,
                    smooth: { type: 'dynamic' },
                })),
            ),
        };

        const network = new Network(containerRef.current, visData, {
            autoResize: true,
            nodes: { shadow: { enabled: true, color: 'rgba(91, 58, 163, 0.12)', size: 10, x: 0, y: 8 } },
            edges: { arrows: { to: { enabled: true, scaleFactor: 0.45 } } },
            physics: {
                enabled: true,
                barnesHut: { gravitationalConstant: -2400, springLength: 160, springConstant: 0.025 },
                stabilization: { iterations: 140 },
            },
            interaction: { hover: true, multiselect: true, navigationButtons: false },
        });

        network.on('click', (params) => {
            if (params.nodes.length === 0) {
                setSelectedNode(null);
                return;
            }

            const nodeId = params.nodes[0];
            const nodeData = filteredNodes.find((node) => node.id === nodeId);

            if (isPathfinderActive) {
                setPathfinderNodes((prev) =>
                    prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId].slice(-2),
                );
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
        <section className="page-graph">
            <div className="graph-header-shell">
                <div>
                    <div className="eyebrow">Özetten fazlası: yapı</div>
                    <h2>Semantik Varlıklar</h2>
                    <p>Atıf yollarını izle, kavram kümelerini incele ve ilişkisel bağlamı görünür tut.</p>
                </div>

                <div className="graph-toolbar">
                    <label className="graph-filter">
                        <Filter size={14} />
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                            <option value="all">Tüm yıllar</option>
                            <option value="2024">2024 ve sonrası</option>
                            <option value="2020">2020 ve sonrası</option>
                        </select>
                    </label>
                    <button
                        className={`btn-secondary ${isPathfinderActive ? 'active' : ''}`}
                        onClick={() => setIsPathfinderActive(!isPathfinderActive)}
                    >
                        <GitBranch size={15} />
                        Yol Bulucu {pathfinderNodes.length > 0 ? `(${pathfinderNodes.length}/2)` : ''}
                    </button>
                </div>
            </div>

            <div className="graph-layout">
                <div className="graph-canvas-shell">
                    <div className="graph-summary-strip">
                        <div className="summary-pill">
                            <strong>{filteredNodes.length}</strong>
                            <span>görünür düğüm</span>
                        </div>
                        <div className="summary-pill">
                            <strong>{filteredEdges.length}</strong>
                            <span>görünür kenar</span>
                        </div>
                        <div className="summary-pill">
                            <strong>{filteredNodes.filter((node) => node.group === 'concept').length}</strong>
                            <span>kavram düğümü</span>
                        </div>
                    </div>

                    <div ref={containerRef} className="graph-canvas" />

                    <div className="graph-legend">
                        <span><i className="legend-dot paper" /> Makale</span>
                        <span><i className="legend-dot concept" /> Kavram</span>
                    </div>
                </div>

                <aside className="graph-side-panel">
                    {!selectedNode && (
                        <div className="surface-card graph-placeholder">
                            <Sparkles size={18} />
                            <strong>Bir düğüm seç</strong>
                            <p>Yerel bağlamını görmek için grafikten bir makale ya da kavram seç.</p>
                        </div>
                    )}

                    {selectedNode && (
                        <div className="surface-card graph-detail-card">
                            <div className="graph-detail-top">
                                <span className={`mini-pill ${selectedNode.group || 'paper'}`}>
                                    {selectedNode.group === 'concept' ? 'kavram' : 'makale'}
                                </span>
                                <button className="icon-ghost-btn" onClick={() => setSelectedNode(null)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <h3>{selectedNode.label}</h3>
                            <p className="graph-detail-subtext">
                                {selectedPaper?.abstract ||
                                    'Bu düğüm yerel araştırma grafiğinin bir parçası. Bu paneli derinleştirmek için daha zengin metadata ekleyin.'}
                            </p>

                            <div className="detail-meta-grid">
                                <div>
                                    <span>Tür</span>
                                    <strong>{selectedNode.group === 'concept' ? 'kavram' : 'makale'}</strong>
                                </div>
                                <div>
                                    <span>Yıl</span>
                                    <strong>{selectedPaper?.year || selectedNode.year || 'yok'}</strong>
                                </div>
                            </div>

                            {selectedPaper?.concepts?.length > 0 && (
                                <div className="detail-chip-block">
                                    <span className="eyebrow">Kavramlar</span>
                                    <div className="chip-row">
                                        {selectedPaper.concepts.slice(0, 6).map((concept) => (
                                            <span key={concept} className="info-chip">{concept}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="graph-actions">
                                <button className="btn-primary">
                                    <ExternalLink size={14} />
                                    Kaynağı aç
                                </button>
                                <button className="btn-secondary">
                                    <Share2 size={14} />
                                    Düğümü paylaş
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
};

function getNodeColor(group) {
    if (group === 'concept') {
        return {
            background: '#ffe4b5',
            border: '#f4b860',
            highlight: { background: '#ffd28a', border: '#ef9f2f' },
        };
    }

    return {
        background: '#efe7ff',
        border: '#a78bfa',
        highlight: { background: '#ddd0ff', border: '#8b5cf6' },
    };
}

export default GraphView;
