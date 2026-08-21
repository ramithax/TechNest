import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-black/80 border border-white/10 text-white shadow-2xl backdrop-blur-xl",
          title: "text-white font-semibold",
          description: "text-white/60",
          actionButton:
            "bg-white text-black hover:bg-white/90",
          cancelButton:
            "bg-white/10 text-white hover:bg-white/20",
        },
      }}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };