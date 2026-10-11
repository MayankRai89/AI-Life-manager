import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveUserProfile } from "../redux/slices/authSlice";
import { addTask } from "../redux/slices/taskSlice";
import MoodCheckin from "../components/MoodCheckin";
import {
  Clock,
  Heart,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Briefcase,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/Button";

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 1: Schedule defaults
  const [wakeTime, setWakeTime] = useState(user?.schedule?.wakeTime || "07:00");
  const [sleepTime, setSleepTime] = useState(user?.schedule?.sleepTime || "23:00");
  const [workStart, setWorkStart] = useState(
    user?.schedule?.workingHours?.start || "09:00"
  );
  const [workEnd, setWorkEnd] = useState(
    user?.schedule?.workingHours?.end || "18:00"
  );

  // Step 3: Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("work");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDescription, setTaskDescription] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskAddedSuccess, setTaskAddedSuccess] = useState(false);

  const handleFinishOnboarding = async () => {
    setIsFinishing(true);
    try {
      await dispatch(saveUserProfile({ onboardingCompleted: true })).unwrap();
    } catch (err) {
      console.warn("Could not persist onboarding status to server:", err);
    } finally {
      setIsFinishing(false);
      navigate("/dashboard");
    }
  };

  const handleStep1Submit = async (e) => {
    if (e) e.preventDefault();
    try {
      await dispatch(
        saveUserProfile({
          schedule: {
            wakeTime,
            sleepTime,
            workingHours: {
              start: workStart,
              end: workEnd,
            },
          },
        })
      );
    } catch (err) {
      console.warn("Failed to save schedule:", err);
    }
    setStep(2);
  };

  const handleStep3AddTask = async (e) => {
    if (e) e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      await dispatch(
        addTask({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          category: taskCategory,
          priority: taskPriority,
          dueDate: new Date().toISOString().split("T")[0],
          dueTime: "17:00",
          estimatedDuration: 30,
        })
      ).unwrap();
      setTaskAddedSuccess(true);
      setTimeout(() => {
        handleFinishOnboarding();
      }, 1000);
    } catch (err) {
      console.error("Failed to add initial task:", err);
      // Still finish onboarding gracefully
      handleFinishOnboarding();
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Header & Global Skip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Welcome to AI Life Manager
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Let's personalize your rhythm
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Skip setup
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span className={step >= 1 ? "text-teal-700 font-extrabold" : ""}>
              1. Daily Hours
            </span>
            <span className={step >= 2 ? "text-teal-700 font-extrabold" : ""}>
              2. Mood Check-in
            </span>
            <span className={step >= 3 ? "text-teal-700 font-extrabold" : ""}>
              3. First Task
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Hours & Schedule */}
        {step === 1 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                Step 1 of 3: Your Daily Schedule
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                When does your day begin and wind down?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your AI assistant will pace suggestions and reminders around these hours.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Default: 07:00 AM</p>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Sleep Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Default: 11:00 PM</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-teal-600" />
                  Working Hours Window
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Start</span>
                    <input
                      type="time"
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">End</span>
                    <input
                      type="time"
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  Skip for now
                </button>
                <Button type="submit" className="gap-2">
                  <span>Next: Mood Check-in</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: First Mood Check-in */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
                <Heart className="h-3.5 w-3.5 text-teal-600" />
                Step 2 of 3: Mood & Energy
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                How are you feeling right now?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your mood shapes how your plan is structured. Log a quick check-in to get started.
              </p>
            </div>

            {/* Reused MoodCheckin component */}
            <MoodCheckin onSuccess={() => setStep(3)} />

            <div className="flex items-center justify-between px-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
              >
                Skip for now
              </button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                className="gap-2"
              >
                <span>Continue to First Task</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Add First Task or Skip */}
        {step === 3 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
                <CheckSquare className="h-3.5 w-3.5 text-teal-600" />
                Step 3 of 3: Action Item
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                What's one thing you'd like to accomplish today?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add your first task, or skip directly to your dashboard.
              </p>
            </div>

            {taskAddedSuccess ? (
              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-teal-900">Task added successfully!</h4>
                <p className="text-xs text-teal-700">Taking you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleStep3AddTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Review quarter goals or drink 2L water"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Details / Context (Optional)
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Any notes or context..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Category
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health & Wellness</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                  >
                    Skip for now
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      isLoading={isAddingTask}
                      className="gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add & Finish</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
