"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface LetterConfiguration {
  id: string;
  name: string;
  letterType: string | null;
  frontLetter: string | null;
  backLetter: string | null;
  frontLetterAdd: string | null;
  tapeDepth: string | null;
  tapeModel: string | null;
  tapeColor: string | null;
  lighting: string | null;
  mounting: string | null;
  substructure: string | null;
  dimmer: string | null;
  pathData: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export default function ConfigurationsPage() {
  const router = useRouter();
  const [configurations, setConfigurations] = useState<LetterConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configToEdit, setConfigToEdit] = useState<LetterConfiguration | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Pobierz wszystkie konfiguracje
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const response = await fetch("/api/letter-config");
      if (!response.ok) throw new Error("Błąd pobierania konfiguracji");
      const data = await response.json();
      setConfigurations(data);
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas pobierania konfiguracji");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!configToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/letter-config/${configToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Błąd usuwania konfiguracji");

      setConfigurations(configurations.filter((c) => c.id !== configToDelete));
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas usuwania konfiguracji");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (config: LetterConfiguration) => {
    setConfigToEdit(config);
    setEditName(config.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!configToEdit || !editName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/letter-config/${configToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...configToEdit,
          name: editName.trim(),
        }),
      });

      if (!response.ok) throw new Error("Błąd aktualizacji konfiguracji");

      await fetchConfigurations();
      setEditDialogOpen(false);
      setConfigToEdit(null);
      setEditName("");
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas aktualizacji konfiguracji");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (config: LetterConfiguration) => {
    // Zapisz konfigurację w localStorage jako pathSession
    const sessionKey = `config_${config.id}_${Date.now()}`;
    
    // Jeśli jest pathData, zapisz je
    if (config.pathData != null) {
      localStorage.setItem(sessionKey, JSON.stringify(config.pathData));
    }

    // Przekieruj do strony edycji z parametrami
    const params = new URLSearchParams();
    if (config.pathData != null) {
      params.set("pathSession", sessionKey);
    }
    params.set("configId", config.id);
    
    router.push(`/letter?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zapisane konfiguracje</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj zapisanymi konfiguracjami liter
          </p>
        </div>
        <Link href="/letter">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do edycji
          </Button>
        </Link>
      </div>

      {configurations.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Brak zapisanych konfiguracji. Utwórz nową konfigurację na stronie
              edycji.
            </p>
            <Link href="/letter">
              <Button className="mt-4">Przejdź do edycji</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configurations.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription>
                  Utworzono: {formatDate(config.createdAt)}
                  <br />
                  Ostatnia aktualizacja: {formatDate(config.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  {config.letterType && (
                    <p>
                      <strong>Rodzaj litery:</strong> {config.letterType}
                    </p>
                  )}
                  {config.pathData != null && (
                    <p className="text-green-600">
                      ✓ Zawiera dane ścieżki
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLoad(config)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Załaduj
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(config)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfigToDelete(config.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog usuwania */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń konfigurację</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę konfigurację? Ta operacja jest
              nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfigToDelete(null);
              }}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj nazwę konfiguracji</DialogTitle>
            <DialogDescription>
              Zmień nazwę tej konfiguracji.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nazwa konfiguracji</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nazwa konfiguracji"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setConfigToEdit(null);
                setEditName("");
              }}
            >
              Anuluj
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()}>
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

