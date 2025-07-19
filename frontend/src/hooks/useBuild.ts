import { useMutation } from "@tanstack/react-query";
import { saveBuild } from "@/api/build";
import { toast } from "@/components/ui/use-toast";

export const useSaveBuild = () => {
  return useMutation({
    mutationFn: saveBuild,
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Сборка успешно сохранена",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить сборку",
        variant: "destructive",
      });
      console.error("Ошибка при сохранении:", error);
    }
  });
};