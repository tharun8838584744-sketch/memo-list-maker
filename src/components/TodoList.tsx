import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
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
    };

    setTasks([...tasks, newTask]);
    setInputValue("");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          My To-Do List
        </h2>

        <div className="flex gap-2 mb-6">
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

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                task.completed
                  ? "bg-muted"
                  : "bg-accent hover:bg-accent/80"
              }`}
            >
              <span
                className={`flex-1 ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.text}
              </span>
              <div className="flex gap-2">
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
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No tasks yet. Add one to get started!
          </p>
        )}
      </Card>
    </div>
  );
};
