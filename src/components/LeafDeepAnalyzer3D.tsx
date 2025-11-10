"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useState, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Activity, Eye, Droplets, Heart, Shield, Pill, RotateCcw, ZoomIn, Info, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type LeafZone = {
  id: string;
  name: string;
  position: [number, number, number];
  damagePercentage: number;
  severity: "healthy" | "mild" | "bad" | "critical";
  diseases: string[];
  symptoms: string[];
  treatment: string[];
  color: string;
};

type LeafAnalysis3DProps = {
  healthPercentage: number;
  stage: number;
  primaryDisease: string;
  category: string;
  severity: "none" | "low" | "medium" | "high";
};

// Helper component to get 2D screen position from 3D world position
function ZoneMarker({ position, zoneId, selectedZone, onPositionUpdate }: {
  position: [number, number, number];
  zoneId: string;
  selectedZone: string | null;
  onPositionUpdate: (zoneId: string, screenPos: { x: number; y: number }) => void;
}) {
  const { camera, size } = useThree();
  
  useEffect(() => {
    if (selectedZone === zoneId) {
      const vector = new THREE.Vector3(...position);
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (-(vector.y) * 0.5 + 0.5) * size.height;
      
      onPositionUpdate(zoneId, { x, y });
    }
  }, [camera, size, position, zoneId, selectedZone, onPositionUpdate]);
  
  return null;
}

// Generate leaf zones based on analysis
function generateLeafZones(analysis: LeafAnalysis3DProps): LeafZone[] {
  const { healthPercentage, stage, primaryDisease, severity } = analysis;
  
  // Define 9 zones of the leaf (tip, upper, middle, lower sections + edges)
  const zones: LeafZone[] = [
    {
      id: "tip",
      name: "Leaf Tip",
      position: [0, 2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "upper-left",
      name: "Upper Left Blade",
      position: [-1.2, 1.2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "upper-right",
      name: "Upper Right Blade",
      position: [1.2, 1.2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "midrib-upper",
      name: "Upper Midrib",
      position: [0, 0.8, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "middle-left",
      name: "Middle Left Blade",
      position: [-1.5, 0, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "middle-right",
      name: "Middle Right Blade",
      position: [1.5, 0, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "lower-left",
      name: "Lower Left Blade",
      position: [-1.2, -1.2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "lower-right",
      name: "Lower Right Blade",
      position: [1.2, -1.2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    },
    {
      id: "base",
      name: "Leaf Base",
      position: [0, -2, 0],
      damagePercentage: 0,
      severity: "healthy",
      diseases: [],
      symptoms: [],
      treatment: [],
      color: "#10b981"
    }
  ];

  // Calculate damage distribution based on stage
  const totalDamage = 100 - healthPercentage;
  
  if (stage === 0 || severity === "none") {
    // Super healthy - all zones green
    return zones;
  }

  // Distribute damage across zones based on stage
  const damagePatterns = {
    1: [0.4, 0.3, 0.2, 0.05, 0.05, 0, 0, 0, 0], // Stage 1: Tip and upper areas
    2: [0.25, 0.25, 0.2, 0.15, 0.1, 0.05, 0, 0, 0], // Stage 2: Spreading to middle
    3: [0.2, 0.15, 0.15, 0.15, 0.15, 0.1, 0.05, 0.03, 0.02] // Stage 3: Widespread
  };

  const pattern = damagePatterns[stage as keyof typeof damagePatterns] || damagePatterns[2];

  zones.forEach((zone, index) => {
    const zoneDamage = totalDamage * pattern[index];
    zone.damagePercentage = Math.round(zoneDamage);

    // Determine severity and color
    if (zoneDamage === 0) {
      zone.severity = "healthy";
      zone.color = "#10b981"; // green
    } else if (zoneDamage < 15) {
      zone.severity = "mild";
      zone.color = "#eab308"; // yellow
    } else if (zoneDamage < 30) {
      zone.severity = "bad";
      zone.color = "#f97316"; // orange
    } else {
      zone.severity = "critical";
      zone.color = "#ef4444"; // red
    }

    // Add diseases and symptoms based on severity
    if (zone.severity !== "healthy") {
      zone.diseases = [primaryDisease];
      
      if (zone.severity === "mild") {
        zone.symptoms = ["Minor discoloration", "Small spots visible", "Early infection signs"];
        zone.treatment = ["Apply preventive fungicide", "Improve air circulation", "Monitor closely"];
      } else if (zone.severity === "bad") {
        zone.symptoms = ["Significant discoloration", "Spreading lesions", "Tissue damage"];
        zone.treatment = ["Immediate fungicide application", "Remove affected tissue", "Isolate plant"];
      } else {
        zone.symptoms = ["Severe necrosis", "Widespread decay", "Structural damage"];
        zone.treatment = ["Emergency treatment required", "Remove all infected tissue", "Systemic fungicide needed"];
      }
    } else {
      zone.symptoms = ["Healthy tissue", "Vibrant color", "No visible damage"];
      zone.treatment = ["Continue regular care", "Maintain current conditions"];
    }
  });

  return zones;
}

// 3D Leaf Component - Updated
function Leaf3D({ zones, onZoneHover, onZoneClick, hoveredZone, selectedZone, onZonePositionUpdate }: { 
  zones: LeafZone[], 
  onZoneHover: (zone: LeafZone | null) => void,
  onZoneClick: (zone: LeafZone) => void,
  hoveredZone: string | null,
  selectedZone: string | null,
  onZonePositionUpdate: (zoneId: string, screenPos: { x: number; y: number }) => void
}) {
  const leafRef = useRef<THREE.Group>(null);

  // Create leaf shape with zones
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Create orchid leaf outline (elongated ellipse)
    const width = 1.8;
    const height = 2.5;
    
    shape.moveTo(0, height);
    shape.bezierCurveTo(width * 0.5, height * 0.8, width * 0.7, height * 0.3, width * 0.75, 0);
    shape.bezierCurveTo(width * 0.7, -height * 0.3, width * 0.5, -height * 0.8, 0, -height);
    shape.bezierCurveTo(-width * 0.5, -height * 0.8, -width * 0.7, -height * 0.3, -width * 0.75, 0);
    shape.bezierCurveTo(-width * 0.7, height * 0.3, -width * 0.5, height * 0.8, 0, height);
    
    return new THREE.ShapeGeometry(shape, 32);
  }, []);

  return (
    <group ref={leafRef}>
      {/* Main leaf body */}
      <mesh geometry={leafGeometry} rotation={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#16a34a" 
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Midrib (central vein) */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.05, 5, 0.02]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>

      {/* Zone markers (interactive spheres) */}
      {zones.map((zone) => (
        <group key={zone.id}>
          <mesh
            position={zone.position}
            onPointerOver={() => onZoneHover(zone)}
            onPointerOut={() => onZoneHover(null)}
            onClick={() => onZoneClick(zone)}
            scale={hoveredZone === zone.id || selectedZone === zone.id ? 1.3 : 1}
          >
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial 
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={hoveredZone === zone.id || selectedZone === zone.id ? 0.5 : 0.2}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          {/* Position tracker for selected zone */}
          {selectedZone === zone.id && (
            <ZoneMarker 
              position={zone.position}
              zoneId={zone.id}
              selectedZone={selectedZone}
              onPositionUpdate={onZonePositionUpdate}
            />
          )}
        </group>
      ))}

      {/* Veins */}
      {[-1, -0.5, 0.5, 1].map((x, i) => (
        <mesh key={`vein-${i}`} position={[x, 0, 0.005]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.02, 3, 0.01]} />
          <meshStandardMaterial color="#15803d" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Analyzer Component
export default function LeafDeepAnalyzer3D({ analysis }: { analysis: LeafAnalysis3DProps }) {
  const [hoveredZone, setHoveredZone] = useState<LeafZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<LeafZone | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [zoneScreenPos, setZoneScreenPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const zones = useMemo(() => generateLeafZones(analysis), [analysis]);

  const stats = useMemo(() => {
    const healthy = zones.filter(z => z.severity === "healthy").length;
    const mild = zones.filter(z => z.severity === "mild").length;
    const bad = zones.filter(z => z.severity === "bad").length;
    const critical = zones.filter(z => z.severity === "critical").length;

    return { healthy, mild, bad, critical, total: zones.length };
  }, [zones]);

  const handleZoneClick = (zone: LeafZone) => {
    setSelectedZone(zone);
    setShowHelp(false);
  };

  const handleZonePositionUpdate = (zoneId: string, screenPos: { x: number; y: number }) => {
    setZoneScreenPos(screenPos);
  };

  const resetView = () => {
    setSelectedZone(null);
    setHoveredZone(null);
    setZoneScreenPos(null);
  };

  // Helper function to get user-friendly health condition text
  const getHealthConditionText = (severity: string) => {
    switch (severity) {
      case "healthy":
        return "Healthy";
      case "mild":
        return "Mild Damage";
      case "bad":
        return "Moderate Damage";
      case "critical":
        return "Critical Damage";
      default:
        return severity;
    }
  };

  // Calculate popup position (place on right side for desktop, bottom for mobile)
  const getPopupStyle = () => {
    if (!zoneScreenPos || !canvasRef.current) return {};
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    if (isMobile) {
      // Mobile: bottom center
      return {
        left: '50%',
        bottom: '20px',
        transform: 'translateX(-50%)',
      };
    } else {
      // Desktop: right side
      return {
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
      };
    }
  };

  // Calculate line path for SVG connector
  const getLinePath = () => {
    if (!zoneScreenPos || !canvasRef.current || !selectedZone) return '';
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = zoneScreenPos.x;
    const startY = zoneScreenPos.y;
    
    let endX, endY;
    
    if (isMobile) {
      // Mobile: line goes to bottom popup
      endX = canvasRect.width / 2;
      endY = canvasRect.height - 180; // popup height offset
    } else {
      // Desktop: line goes to right popup
      endX = canvasRect.width - 280; // popup width offset
      endY = canvasRect.height / 2;
    }
    
    // Create a curved path
    const controlX = (startX + endX) / 2;
    const controlY = (startY + endY) / 2;
    
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                3D Deep Leaf Analysis
              </CardTitle>
              <CardDescription className="text-base">
                Interactive zone-by-zone damage visualization • Rotate 360° • Zoom • {isMobile ? "Tap" : "Click"} zones for details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-2 border-green-200 dark:border-green-800 overflow-hidden">
            <CardContent className="p-0">
              <div 
                ref={canvasRef}
                className="relative w-full aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
              >
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                  <OrbitControls 
                    enablePan={false}
                    minDistance={5}
                    maxDistance={15}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                  
                  {/* Lighting */}
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <directionalLight position={[-5, -5, -5]} intensity={0.3} />
                  <pointLight position={[0, 0, 5]} intensity={0.5} />
                  
                  {/* Environment for reflections */}
                  <Environment preset="sunset" />
                  
                  {/* Leaf */}
                  <Leaf3D 
                    zones={zones} 
                    onZoneHover={setHoveredZone}
                    onZoneClick={handleZoneClick}
                    hoveredZone={hoveredZone?.id || null}
                    selectedZone={selectedZone?.id || null}
                    onZonePositionUpdate={handleZonePositionUpdate}
                  />
                </Canvas>

                {/* Connecting Line (SVG overlay) */}
                {selectedZone && zoneScreenPos && (
                  <svg 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                      >
                        <circle 
                          cx="5" 
                          cy="5" 
                          r="3" 
                          fill={selectedZone.color}
                        />
                      </marker>
                    </defs>
                    <path
                      d={getLinePath()}
                      stroke={selectedZone.color}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                )}

                {/* Diagram-Style Popup Info Box */}
                {selectedZone && zoneScreenPos && (
                  <div 
                    className={`absolute z-20 pointer-events-auto ${
                      isMobile ? 'w-[calc(100%-40px)] max-w-md' : 'w-72'
                    }`}
                    style={getPopupStyle()}
                  >
                    <div 
                      className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 p-4 space-y-3"
                      style={{ borderColor: selectedZone.color }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 pb-2 border-b" style={{ borderColor: selectedZone.color + '40' }}>
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{selectedZone.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: selectedZone.color }}
                            />
                            <Badge 
                              className="text-xs text-white" 
                              style={{ backgroundColor: selectedZone.color }}
                            >
                              {getHealthConditionText(selectedZone.severity)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedZone.damagePercentage > 0 
                              ? `${selectedZone.damagePercentage}% affected`
                              : "No damage detected"
                            }
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 -mt-1 -mr-1"
                          onClick={() => {
                            setSelectedZone(null);
                            setZoneScreenPos(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" style={{ color: selectedZone.color }} />
                          Symptoms
                        </h4>
                        <ul className="space-y-1">
                          {selectedZone.symptoms.slice(0, 3).map((symptom, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-[10px] mt-0.5">•</span>
                              <span className="flex-1">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Diseases */}
                      {selectedZone.diseases.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" style={{ color: selectedZone.color }} />
                            Detected Issues
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedZone.diseases.map((disease, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5">
                                {disease}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treatment (condensed) */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5" style={{ color: selectedZone.color }} />
                          Care Tips
                        </h4>
                        <ul className="space-y-1">
                          {selectedZone.treatment.slice(0, 2).map((tip, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="flex-shrink-0 w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] font-bold"
                                    style={{ backgroundColor: selectedZone.color }}>
                                {i + 1}
                              </span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => {
                          setSelectedZone(null);
                          setZoneScreenPos(null);
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs"
                      >
                        Close & Select Another Zone
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hover Tooltip - Desktop only, when no zone selected */}
                {hoveredZone && !selectedZone && !isMobile && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-black/90 to-gray-900/90 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md z-10 pointer-events-none border border-white/10 min-w-[240px]">
                    <p className="font-bold text-base text-center mb-1">{hoveredZone.name}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg" 
                        style={{ backgroundColor: hoveredZone.color }}
                      />
                      <p className="text-sm font-semibold" style={{ 
                        color: hoveredZone.severity === "healthy" ? "#10b981" : 
                               hoveredZone.severity === "mild" ? "#eab308" : 
                               hoveredZone.severity === "bad" ? "#f97316" : "#ef4444"
                      }}>
                        {getHealthConditionText(hoveredZone.severity)}
                      </p>
                    </div>
                    {hoveredZone.damagePercentage > 0 && (
                      <p className="text-xs text-gray-300 text-center mt-1">
                        {hoveredZone.damagePercentage}% affected
                      </p>
                    )}
                  </div>
                )}

                {/* Help Overlay */}
                {showHelp && !selectedZone && (
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm max-w-xs z-10">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-foreground">Interactive Controls:</p>
                        <ul className="text-muted-foreground space-y-0.5">
                          <li>• Drag to rotate the leaf</li>
                          <li>• Scroll to zoom in/out</li>
                          {!isMobile && <li>• Hover over zones for info</li>}
                          <li>• {isMobile ? "Tap" : "Click"} zones for detailed popup</li>
                        </ul>
                        <Button 
                          onClick={() => setShowHelp(false)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs mt-2 w-full"
                        >
                          Got it
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Instruction Overlay */}
                {isMobile && !selectedZone && !showHelp && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm z-10 pointer-events-none text-sm font-medium animate-pulse">
                    👆 Tap any colored zone
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Color Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-sm">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm" />
                  <span className="text-sm">Mild</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm" />
                  <span className="text-sm">Bad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-sm">Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Details Panel (Desktop) */}
        <div className="space-y-4 hidden lg:block">
          {/* Overall Statistics */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Overall Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-5xl font-black mb-2 ${
                  analysis.healthPercentage >= 90 ? "text-green-600 dark:text-green-400" :
                  analysis.healthPercentage >= 70 ? "text-green-600 dark:text-green-400" :
                  analysis.healthPercentage >= 45 ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                }`}>
                  {analysis.healthPercentage}%
                </div>
                <p className="text-sm text-muted-foreground">Healthy Tissue</p>
              </div>

              <Progress value={analysis.healthPercentage} className="h-3" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Healthy Zones
                  </span>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                    {stats.healthy}/{stats.total}
                  </Badge>
                </div>
                {stats.mild > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-yellow-600" />
                      Mild Damage
                    </span>
                    <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/30">
                      {stats.mild}
                    </Badge>
                  </div>
                )}
                {stats.bad > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Bad Damage
                    </span>
                    <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">
                      {stats.bad}
                    </Badge>
                  </div>
                )}
                {stats.critical > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      Critical Damage
                    </span>
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30">
                      {stats.critical}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instruction Card */}
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-2 py-4">
                <ZoomIn className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto opacity-70" />
                <p className="text-sm font-medium text-foreground">
                  Click any colored zone
                </p>
                <p className="text-xs text-muted-foreground">
                  A labeled popup will appear with detailed zone information
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Disease Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stage</span>
                <Badge variant="outline">{analysis.stage}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primary Disease</span>
                <span className="font-medium text-right text-xs">{analysis.primaryDisease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-right text-xs">{analysis.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}