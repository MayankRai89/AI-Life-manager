import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  editTask,
  toggleStatus,
  removeTask,
  setFilter,
} from "../redux/slices/taskSlice";
import { fetchAIPrioritizedTasks } from "../redux/slices/aiSlice";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { VoiceInputButton } from "./VoiceInputButton";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Zap,
  Tag,
  Search,
} from "lucide-react";

export function TaskList({ showHeader = true, maxItems = null }) {
  const dispatch = useDispatch();
  const { tasks, filter, loading } = useSelector((state) => state.tasks);
  const { loadingScores } = useSelector((state) => state.ai);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueTime, setDueTime] = useState("17:00");
  const [estimatedDuration, setEstimatedDuration] = useState("30");

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("work");
    setPriority("medium");
    setDueDate(new Date().toISOString().split("T")[0]);
    setDueTime("17:00");
    setEstimatedDuration("30");
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setCategory(task.category || "work");
    setPriority(task.priority || "medium");
    setDueDate(
      task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setDueTime(task.dueTime || "17:00");
    setEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : "30");
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      dueTime,
      estimatedDuration: Number(estimatedDuration) || 30,
    };

    if (editingTask) {
      dispatch(editTask({ id: editingTask._id, taskData: payload }));
    } else {
      dispatch(addTask(payload));
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    dispatch(toggleStatus({ id: task._id, nextStatus }));
  };

  const handleDelete = (id) => {
    dispatch(removeTask(id));
  };

  const handlePrioritize = () => {
    dispatch(fetchAIPrioritizedTasks());
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter((t) => {
    if (filter.status === "pending" && t.status === "completed") return false;
    if (filter.status === "completed" && t.status !== "completed") return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    if (filter.category !== "all" && t.category !== filter.category) return false;
    if (
      filter.searchQuery &&
      !t.title.toLowerCase().includes(filter.searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const displayedTasks = maxItems
    ? filteredTasks.slice(0, maxItems)
    : filteredTasks;

  const getPriorityBadgeVariant = (p) => {
    switch (p) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Your Action Items</h3>
            <p className="text-xs text-slate-500">
              Tasks scored by cognitive priority & mood alignment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrioritize}
              isLoading={loadingScores}
              className="gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>{loadingScores ? "Tuning priorities..." : "Prioritize for today"}</span>
            </Button>

            <Button
              size="sm"
              onClick={openCreateModal}
              className="gap-1.5 bg-teal-600 text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>
      )}

      {/* Thoughtful loading state for task prioritization */}
      {loadingScores && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/80 via-cyan-50/60 to-white p-3.5 text-xs text-teal-900 animate-pulse">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-600" />
          </div>
          <span>Looking at what matters most... matching tasks with your headspace.</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-2.5 border border-slate-200/70">
        <div className="flex items-center gap-1.5">
          {["all", "pending", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => dispatch(setFilter({ status: st }))}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                filter.status === st
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery || ""}
            onChange={(e) => dispatch(setFilter({ searchQuery: e.target.value }))}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 p-8 text-center">
            <p className="text-xs text-slate-500">
              No tasks found for this view. Create one to get started!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="mt-3 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Task</span>
            </Button>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task._id}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                  isCompleted
                    ? "border-slate-200/60 bg-slate-50/60 opacity-70"
                    : "border-slate-200/80 bg-white hover:border-teal-200 hover:shadow-xs"
                }`}
              >
                {/* Left: Status Toggle & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-teal-600 transition cursor-pointer shrink-0"
                    title={isCompleted ? "Mark incomplete" : "Mark completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600 fill-teal-50" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-teal-500" />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold text-slate-800 break-words ${
                          isCompleted ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Human-Friendly AI Priority Badge with visual dot & expandable why */}
                      {(task.aiScore !== undefined && task.aiScore !== null) ? (
                        <TaskPriorityBadge
                          score={task.aiScore}
                          reason={task.aiReason}
                          isLoading={loadingScores}
                          showWhyAffordance={true}
                        />
                      ) : null}
                    </div>

                    {/* AI Reason Subtitle directly under task for trust-building */}
                    {task.aiReason && !isCompleted && (
                      <p className="text-xs text-teal-800/90 font-medium flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>{task.aiReason}</span>
                      </p>
                    )}

                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      {/* Only show raw priority badge if AI score is not already providing it */}
                      {(task.aiScore === undefined || task.aiScore === null) && (
                        <Badge
                          variant={getPriorityBadgeVariant(task.priority)}
                          className="capitalize text-[10px]"
                        >
                          {task.priority}
                        </Badge>
                      )}

                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {task.category || "work"}
                      </span>

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {task.dueDate.split("T")[0]}
                          {task.dueTime && ` · ${task.dueTime}`}
                        </span>
                      )}

                      {task.estimatedDuration && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {task.estimatedDuration} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                    title="Edit task"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Action Item" : "Create New Action Item"}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Task Title *
              </label>
              <VoiceInputButton
                onResult={(transcription) => {
                  setTitle((prev) => (prev ? `${prev} ${transcription}` : transcription));
                }}
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Conduct user feedback session"
              required
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description (Optional)
              </label>
              <VoiceInputButton
                onResult={(transcription) => {
                  setDescription((prev) => (prev ? `${prev} ${transcription}` : transcription));
                }}
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or notes for this task..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="work">Work</option>
                <option value="health">Health & Wellness</option>
                <option value="personal">Personal</option>
                <option value="fitness">Fitness</option>
                <option value="study">Study</option>
                <option value="finance">Finance</option>
                <option value="errand">Errand</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
            <Input
              label="Est. Mins"
              type="number"
              min="5"
              max="480"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? "Update Task" : "Add to Dashboard"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TaskList;
