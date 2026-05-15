"use client";

import { useEffect, useState } from "react";
import type { SubcategoryItem } from "@/src/types/api";
import { fetchSubcategories, fetchDisciplines } from "@/src/modules/training/model/training-api";
import { ApiError } from "@/src/lib/api-client";

export function useTrainingAreas() {
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("Todas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchDisciplines()
      .then((disciplineList) => {
        if (cancelled) return;
        const allDisciplines = ["Todas", ...disciplineList];
        setDisciplines(allDisciplines);
        return Promise.all(
          disciplineList.map((d) => fetchSubcategories(d))
        );
      })
      .then((results) => {
        if (cancelled || !results) return;
        setSubcategories(results.flat());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isSubscriptionRequired) {
          setLocked(true);
        } else {
          setError((err as Error).message ?? "Erro ao carregar.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = subcategories.filter((s) => {
    const matchesDiscipline =
      selectedDiscipline === "Todas" || s.discipline === selectedDiscipline;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.discipline.toLowerCase().includes(search.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  return {
    filtered,
    disciplines,
    selectedDiscipline,
    setSelectedDiscipline,
    search,
    setSearch,
    loading,
    locked,
    error,
  };
}
