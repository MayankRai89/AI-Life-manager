import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { Sparkles, Home, Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Workout = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get("/workouts/exercises");
        setExercises(response.data);
      } catch (error) {
        console.error("Failed to fetch exercises", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  return (
    <>
      <div className="dashboard-layout" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
            gap: "16px",
            zIndex: 10,
          }}
        >
          <button 
            onClick={() => navigate("/")}
            className="btn-icon" 
            style={{ padding: "8px" }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={24} color="var(--accent-cyan)" />
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              Workout Program
            </h1>
          </div>
        </header>

        <main>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
              <div className="nav-orb">
                <Sparkles size={24} color="white" className="spin-animation" />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {exercises.map((exercise, idx) => (
                <motion.div
                  key={exercise.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-panel"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 style={{ fontSize: "1.2rem", color: "var(--accent-purple)", textTransform: "capitalize" }}>
                    {exercise.code ? exercise.code.replace(/_/g, " ") : "Unknown Exercise"}
                  </h3>
                  
                  {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {exercise.primaryMuscles.map((muscle) => (
                        <span
                          key={muscle.id}
                          style={{
                            background: "rgba(99, 102, 241, 0.1)",
                            color: "var(--accent-purple)",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "0.8rem",
                            border: "1px solid rgba(99, 102, 241, 0.2)"
                          }}
                        >
                          {muscle.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle.id}
                          style={{
                            background: "rgba(6, 182, 212, 0.1)",
                            color: "var(--accent-cyan)",
                            padding: "2px 10px",
                            borderRadius: "16px",
                            fontSize: "0.75rem",
                            border: "1px solid rgba(6, 182, 212, 0.2)"
                          }}
                        >
                          {muscle.name}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Workout;
