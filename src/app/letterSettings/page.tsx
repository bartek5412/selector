// src/app/letterSettings/page.tsx
"use client";
import { DataTable } from "@/components/ui/dataTable";
import {
  createEditableColumns,
  LetterSettings,
} from "@/app/letterSettings/letterColumns";
import { useLetters } from "@/hooks/useLetters";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function LetterSettingsPage() {
  const {
    data,
    loading,
    error,
    filterLetters,
    updateLetter,
    deleteLetter,
    addLetter,
    getUniqueElementTypes,
    refetch,
  } = useLetters();
  const [newLetter, setNewLetter] = useState<LetterSettings>({
    id: "",
    name: "",
    description: "",
    price: 0,
    elementType: "",
    elementValue: 0,
    margin: 0,
    unit: "",
  });
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Obsługa filtrowania
  const handleFilter = async (elementType: string) => {
    try {
      if (elementType === "") {
        await refetch();
      } else {
        await filterLetters(elementType);
      }
      setSelectedFilter(elementType);
    } catch {
      alert("Wystąpił błąd podczas filtrowania danych");
    }
  };

  // Resetowanie filtra
  const handleResetFilter = async () => {
    try {
      await refetch();
      setSelectedFilter("");
      setSearchQuery("");
    } catch {
      alert("Wystąpił błąd podczas resetowania filtra");
    }
  };

  // Obsługa zapisywania
  const handleSave = async (id: string, changes: Partial<LetterSettings>) => {
    try {
      await updateLetter(id, changes);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addLetter(newLetter);
      alert("Parametr został zapisany!");
      setNewLetter({
        id: "",
        name: "",
        description: "",
        price: 0,
        elementType: "",
        elementValue: 0,
        margin: 0,
        unit: "",
      });
      setIsDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd podczas zapisywania parametru");
    }
  };

  // Obsługa usuwania z potwierdzeniem
  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten rekord?")) {
      return;
    }

    try {
      await deleteLetter(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania"
      );
    }
  };

  // Filtrowanie danych po wyszukiwaniu
  const filteredData = data.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.elementType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });


  const uniqueTypes = getUniqueElementTypes();
  const columns = createEditableColumns(handleSave, handleSave, handleDelete, uniqueTypes);

  // Funkcja do formatowania nazwy typu elementu
  const formatElementType = (type: string) => {
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="container mx-auto mt-10 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parametry konfiguracyjne liter</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj opcjami konfiguracji dla liter
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj parametr
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dodaj nowy parametr</DialogTitle>
              <DialogDescription>
                Wypełnij formularz, aby dodać nowy parametr konfiguracyjny
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa *</Label>
                  <Input
                    id="name"
                    value={newLetter.name}
                    onChange={(e) =>
                      setNewLetter({ ...newLetter, name: e.target.value })
                    }
                    placeholder="Wprowadź nazwę"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Opis *</Label>
                  <Input
                    id="description"
                    value={newLetter.description}
                    onChange={(e) =>
                      setNewLetter({
                        ...newLetter,
                        description: e.target.value,
                      })
                    }
                    placeholder="Wprowadź opis"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Cena *</Label>
                  <Input
                    type="number"
                    id="price"
                    value={newLetter.price}
                    onChange={(e) =>
                      setNewLetter({
                        ...newLetter,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elementType">Typ elementu *</Label>
                  <Select
                    value={newLetter.elementType}
                    onValueChange={(value) =>
                      setNewLetter({ ...newLetter, elementType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ elementu" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatElementType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elementValue">Wartość</Label>
                  <Input
                    type="number"
                    id="elementValue"
                    value={newLetter.elementValue}
                    onChange={(e) =>
                      setNewLetter({
                        ...newLetter,
                        elementValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin">Marża</Label>
                  <Input
                    type="number"
                    id="margin"
                    value={newLetter.margin}
                    onChange={(e) =>
                      setNewLetter({
                        ...newLetter,
                        margin: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Jednostka *</Label>
                  <Select
                    value={newLetter.unit}
                    onValueChange={(value) =>
                      setNewLetter({ ...newLetter, unit: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz jednostkę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="m²">m²</SelectItem>
                      <SelectItem value="szt">szt</SelectItem>
                      <SelectItem value="kpl">kpl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewLetter({
                      id: "",
                      name: "",
                      description: "",
                      price: 0,
                      elementType: "",
                      elementValue: 0,
                      margin: 0,
                      unit: "",
                    });
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit">Dodaj parametr</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Ładowanie danych...</div>
        </div>
      )}

      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-red-800 dark:text-red-200">
              <strong>Błąd:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Wyszukiwanie i filtry */}
          <Card className="bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Wyszukiwanie i filtry</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Wyszukaj parametry lub filtruj po typie elementu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Wyszukaj po nazwie, opisie lub typie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedFilter || "all"} onValueChange={(value) => handleFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtruj po typie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie ({data.length})</SelectItem>
                    {uniqueTypes.map((type) => {
                      const count = data.filter((d) => d.elementType === type).length;
                      return (
                        <SelectItem key={type} value={type}>
                          {formatElementType(type)} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {(selectedFilter || searchQuery) && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilter}
                  >
                    Wyczyść filtry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-700 dark:text-blue-300">Łączna liczba</CardDescription>
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">{filteredData.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-700 dark:text-green-300">Typy elementów</CardDescription>
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">{uniqueTypes.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabela danych */}
          <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                {selectedFilter
                  ? `Parametry: ${formatElementType(selectedFilter)}`
                  : "Wszystkie parametry"}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {filteredData.length > 0
                  ? `Znaleziono ${filteredData.length} rekordów`
                  : "Brak wyników"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredData.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <DataTable
                    columns={columns as ColumnDef<LetterSettings>[]}
                    data={filteredData as LetterSettings[]}
                  />
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Brak wyników do wyświetlenia</p>
                  <p className="text-sm mt-2">
                    Spróbuj zmienić filtry lub dodaj nowy parametr
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
