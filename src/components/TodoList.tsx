import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, X, CalendarIcon, AlertCircle } from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

type SortOption = "none" | "deadline";

export const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("deadline");

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(tasksWithDates);
      } catch (e) {
        console.error("Failed to parse tasks from localStorage");
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const trimmedText = inputValue.trim();
    if (!trimmedText) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: trimmedText,
      completed: false,
      dueDate: selectedDate,
    };

    setTasks([...tasks, newTask]);
    setInputValue("");
    setSelectedDate(undefined);
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.completed) return false;
    const today = startOfDay(new Date());
    const taskDueDate = startOfDay(task.dueDate);
    return isBefore(taskDueDate, today);
  };

  const getSortedTasks = () => {
    if (sortBy === "none") return tasks;

    return [...tasks].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // If both have due dates, sort by date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }

      // Tasks with due dates come before tasks without
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return 0;
    });
  };

  const sortedTasks = getSortedTasks();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          My To-Do List
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add new task..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addTask} className="px-6">
              Add
            </Button>
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP")
                    : "Set due date (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === "deadline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSortBy("deadline")}
            >
              Deadline
            </Button>
            <Button
              variant={sortBy === "none" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSortBy("none")}
            >
              None
            </Button>
          </div>
        </div>

        <ul className="space-y-3">
          {sortedTasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <li
                key={task.id}
                className={cn(
                  "flex flex-col p-3 rounded-lg transition-all duration-200",
                  task.completed
                    ? "bg-muted"
                    : overdue
                    ? "bg-warning/10 border border-warning/30"
                    : "bg-accent hover:bg-accent/80"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "break-words",
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {task.text}
                    </div>
                    {task.dueDate && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs mt-1",
                          task.completed
                            ? "text-muted-foreground"
                            : overdue
                            ? "text-warning font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {overdue && <AlertCircle className="h-3 w-3" />}
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {format(task.dueDate, "PPP")}
                          {overdue && " (Overdue)"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={task.completed ? "secondary" : "default"}
                      onClick={() => toggleComplete(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No tasks yet. Add one to get started!
          </p>
        )}

        {tasks.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {tasks.filter((t) => !t.completed).length} active •{" "}
            {tasks.filter((t) => t.completed).length} completed
          </div>
        )}
      </Card>
    </div>
  );
};
