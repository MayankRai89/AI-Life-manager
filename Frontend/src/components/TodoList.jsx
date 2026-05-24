import { CheckCircle2, Circle, Sparkles, Plus, Sun, Brain, Coffee, BookOpen, Moon, Wind } from "lucide-react";
import { motion } from "framer-motion";

const TodoList = ({ tasks, activeTab, setActiveTab, toggleTaskStatus }) => {
  const getTaskIcon = (index) => {
    const icons = [
      <Sun size={18} />,
      <Brain size={18} />,
      <Coffee size={18} />,
      <BookOpen size={18} />,
      <Moon size={18} />,
      <Wind size={18} />,
    ];
    return icons[index % icons.length];
  };

  const filteredTasks = tasks.filter((task) => {
    if (!task.created_at) return true;

    const taskDate = new Date(task.created_at);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const weekAgoStart = new Date(todayStart);
    weekAgoStart.setDate(weekAgoStart.getDate() - 7);
    
    if (activeTab === "Today") {
      return taskDate >= todayStart && taskDate < tomorrowStart;
    } else if (activeTab === "Yesterday") {
      return taskDate >= yesterdayStart && taskDate < todayStart;
    } else if (activeTab === "This Week") {
      return taskDate >= weekAgoStart && taskDate < tomorrowStart;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100%",
        maxHeight: "calc(100vh - 140px)",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <Sparkles size={18} color="var(--accent-purple)" /> AI Generated To-Do List
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Personalized for your goals and energy.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "rgba(0,0,0,0.3)",
          padding: "4px",
          borderRadius: "8px",
        }}
      >
        {["Today", "Yesterday", "This Week"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              background:
                activeTab === tab ? "rgba(139, 92, 246, 0.2)" : "transparent",
              color: activeTab === tab ? "var(--text-primary)" : "var(--text-secondary)",
              border:
                activeTab === tab ? "1px solid var(--accent-purple)" : "1px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingRight: "4px",
        }}
      >
        {filteredTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginTop: "20px",
              fontSize: "0.9rem",
            }}
          >
            No tasks found for {activeTab}.
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="glass-panel-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
              }}
            >
              <div style={{ color: "var(--accent-purple)" }}>
                {getTaskIcon(index)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color:
                      task.status === "done" ? "var(--text-secondary)" : "var(--text-primary)",
                    textDecoration: task.status === "done" ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </div>
                {task.description && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                    }}
                  >
                    {task.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: task.status === "done" ? "var(--accent-purple)" : "var(--text-secondary)",
                }}
              >
                {task.status === "done" ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
            </div>
          ))
        )}
      </div>

      <button
        className="btn-icon"
        style={{
          padding: "12px",
          width: "100%",
          gap: "8px",
          color: "var(--accent-cyan)",
          borderColor: "rgba(6, 182, 212, 0.3)",
        }}
      >
        <Plus size={16} /> Add Custom Task
      </button>
    </motion.div>
  );
};

export default TodoList;
