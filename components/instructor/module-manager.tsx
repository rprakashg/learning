"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, ChevronDown, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { LessonManager } from "./lesson-manager";

interface Lesson {
  id: string;
  title: string;
  isFree: boolean;
  position: number;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
}

export function ModuleManager({ courseId, modules }: ModuleManagerProps) {
  const router = useRouter();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    setAdding(true);

    await fetch(`/api/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle }),
    });

    setNewModuleTitle("");
    setShowForm(false);
    setAdding(false);
    router.refresh();
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Modules & Lessons</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <PlusCircle className="h-4 w-4" />
          Add module
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Module title"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addModule()}
          />
          <Button onClick={addModule} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}

      {modules.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No modules yet.</p>
          <p className="text-xs text-gray-400">Add a module to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map((module) => (
            <div key={module.id} className="rounded-xl border border-gray-200">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => toggleModule(module.id)}
              >
                <span className="font-medium text-gray-800">{module.title}</span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{module.lessons.length} lessons</span>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>

              {expandedModules.has(module.id) && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <LessonManager
                    courseId={courseId}
                    moduleId={module.id}
                    lessons={module.lessons}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
