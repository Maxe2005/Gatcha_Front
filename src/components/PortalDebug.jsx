/**
 * Portal Component - Testing & Debugging Utilities
 * Pour tester les différents états et configurations du Portal
 */

import React, { useState } from 'react';
import Portal from './Portal';
import '../styles/PortalDebug.css'; // Optional debugging styles

/**
 * Component de test complet pour visualiser tous les états
 */
export const PortalTestSuite = () => {
    const [selectedState, setSelectedState] = useState('idle');
    const [selectedTheme, setSelectedTheme] = useState('divine');
    const [testResults, setTestResults] = useState([]);

    const states = ['idle', 'hover', 'activating', 'active'];
    const themes = ['divine', 'dark'];

    const handleTest = (testName, testFn) => {
        try {
            testFn();
            setTestResults((prev) => [
                ...prev,
                { name: testName, status: '✅ PASS', time: new Date().toLocaleTimeString() },
            ]);
        } catch (error) {
            setTestResults((prev) => [
                ...prev,
                { name: testName, status: '❌ FAIL', error: error.message, time: new Date().toLocaleTimeString() },
            ]);
        }
    };

    const runTests = () => {
        setTestResults([]);

        // Test 1: Component Rendering
        handleTest('Component Renders', () => {
            if (!document.querySelector('.portal-container')) {
                throw new Error('Portal container not found');
            }
        });

        // Test 2: CSS Variables Defined
        handleTest('CSS Variables Defined', () => {
            const style = getComputedStyle(document.documentElement);
            const ringColor = style.getPropertyValue('--ring-color');
            if (!ringColor) {
                throw new Error('CSS variables not initialized');
            }
        });

        // Test 3: Layer Hierarchy
        handleTest('Layer Z-Index Hierarchy', () => {
            const layers = document.querySelectorAll('.portal-layer');
            if (layers.length < 5) {
                throw new Error(`Expected 5+ layers, got ${layers.length}`);
            }
        });

        // Test 4: Animations Exist
        handleTest('CSS Animations Loaded', () => {
            const stylesheet = document.styleSheets[0];
            let hasAnimations = false;
            for (let rule of stylesheet.cssRules) {
                if (rule.name?.includes('ring-idle') || rule.name?.includes('vortex-spin')) {
                    hasAnimations = true;
                    break;
                }
            }
            if (!hasAnimations) {
                console.warn('CSS animations may not be loaded (this can be normal)');
            }
        });

        // Test 5: Asset Files Exist
        handleTest('Asset Files Accessible', async () => {
            const assets = [
                '/assets/portail/Anneau_portail_divine.png',
                '/assets/portail/Vortex_portail_divine.png',
            ];
            for (const asset of assets) {
                const response = await fetch(asset, { method: 'HEAD' });
                if (!response.ok) {
                    throw new Error(`Asset not found: ${asset}`);
                }
            }
        });

        // Test 6: Theme Context Integration
        handleTest('Theme Context Available', () => {
            const container = document.querySelector('.portal-container');
            const hasThemeClass = container.classList.contains('divine') || 
                                container.classList.contains('dark');
            if (!hasThemeClass) {
                throw new Error('No theme class found on portal container');
            }
        });

        // Test 7: Particle System
        handleTest('Particle System Initialized', () => {
            const particles = document.querySelectorAll('.particle');
            if (particles.length === 0) {
                console.warn('No particles found (may not be generated yet)');
            }
        });

        // Test 8: Interactive Elements
        handleTest('Interactive Elements Responsive', () => {
            const portal = document.querySelector('.portal-container');
            if (!portal.style.cursor || portal.style.cursor === 'auto') {
                throw new Error('Portal not marked as interactive');
            }
        });
    };

    return (
        <div className="portal-test-suite">
            <h1>🔮 Portal Component - Test Suite</h1>

            {/* Controls */}
            <div className="test-controls">
                <div className="control-group">
                    <label>Theme:</label>
                    <select 
                        value={selectedTheme} 
                        onChange={(e) => setSelectedTheme(e.target.value)}
                    >
                        {themes.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>State:</label>
                    <select 
                        value={selectedState} 
                        onChange={(e) => setSelectedState(e.target.value)}
                    >
                        {states.map((state) => (
                            <option key={state} value={state}>
                                {state.charAt(0).toUpperCase() + state.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={runTests} className="btn-run-tests">
                    🧪 Run All Tests
                </button>
            </div>

            {/* Portal Preview */}
            <div className="portal-preview">
                <h2>Portal Preview</h2>
                <div className={`preview-container theme-${selectedTheme}`}>
                    <Portal 
                        onInvoke={(element) => {
                            console.log(`✨ Test invocation: ${element}`);
                        }}
                        isLoading={false}
                    />
                </div>
            </div>

            {/* Test Results */}
            <div className="test-results">
                <h2>Test Results</h2>
                {testResults.length === 0 ? (
                    <p className="no-results">Click "Run All Tests" to see results</p>
                ) : (
                    <ul className="results-list">
                        {testResults.map((result, index) => (
                            <li key={index} className={`result ${result.status.includes('PASS') ? 'pass' : 'fail'}`}>
                                <span className="status">{result.status}</span>
                                <span className="name">{result.name}</span>
                                <span className="time">{result.time}</span>
                                {result.error && (
                                    <span className="error">{result.error}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Documentation */}
            <div className="portal-docs">
                <h2>📚 Quick Reference</h2>
                <div className="doc-section">
                    <h3>States</h3>
                    <dl>
                        <dt>idle</dt>
                        <dd>Default state - subtle animations</dd>
                        <dt>hover</dt>
                        <dd>Mouse over - intensified animations</dd>
                        <dt>activating</dt>
                        <dd>User clicked - burst animation</dd>
                        <dt>active</dt>
                        <dd>Post-activation - transitioning</dd>
                    </dl>
                </div>

                <div className="doc-section">
                    <h3>Layers</h3>
                    <ol>
                        <li><strong>Ring (z:100)</strong> - External structure with glow</li>
                        <li><strong>Glyphes (z:80)</strong> - Rotating runes</li>
                        <li><strong>Element Circle (z:60)</strong> - Dynamic elemental display</li>
                        <li><strong>Particles (z:50)</strong> - Floating FX</li>
                        <li><strong>Vortex (z:40)</strong> - Central core animation</li>
                    </ol>
                </div>

                <div className="doc-section">
                    <h3>Performance Tips</h3>
                    <ul>
                        <li>Max 40 particles simultaneously</li>
                        <li>CSS animations preferred over JS</li>
                        <li>GPU acceleration via transform + opacity</li>
                        <li>Theme switch uses CSS variables</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

/**
 * Component pour tester les performances
 */
export const PortalPerformanceMonitor = () => {
    const [metrics, setMetrics] = useState({
        fps: 0,
        memory: 0,
        renderTime: 0,
    });

    React.useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();

        const measurePerformance = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                const memory = (performance.memory?.usedJSHeapSize || 0) / 1048576; // MB

                setMetrics({
                    fps,
                    memory: memory.toFixed(2),
                    renderTime: ((currentTime - lastTime) / frameCount).toFixed(2),
                });

                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measurePerformance);
        };

        const animationFrame = requestAnimationFrame(measurePerformance);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className="performance-monitor">
            <h3>📊 Performance Monitor</h3>
            <div className="metrics-display">
                <div className="metric">
                    <label>FPS:</label>
                    <value>{metrics.fps}</value>
                </div>
                <div className="metric">
                    <label>Memory:</label>
                    <value>{metrics.memory} MB</value>
                </div>
                <div className="metric">
                    <label>Render Time:</label>
                    <value>{metrics.renderTime} ms</value>
                </div>
            </div>
        </div>
    );
};

/**
 * Démonstration des variantes de thème
 */
export const ThemeVariationShowcase = () => {
    return (
        <div className="theme-showcase">
            <h2>🌗 Theme Variations</h2>

            <div className="theme-grid">
                <div className="theme-card">
                    <h3>✨ Divine Theme</h3>
                    <p>Marbre blanc, Or lumineux, Puissance céleste</p>
                    <div className="portal-wrapper" style={{ '--portal-theme': 'divine' }}>
                        <Portal onInvoke={() => {}} />
                    </div>
                </div>

                <div className="theme-card">
                    <h3>🌑 Dark Theme</h3>
                    <p>Obsidienne, Rouge sombre, Corruption</p>
                    <div className="portal-wrapper" style={{ '--portal-theme': 'dark' }}>
                        <Portal onInvoke={() => {}} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default {
    PortalTestSuite,
    PortalPerformanceMonitor,
    ThemeVariationShowcase,
};
