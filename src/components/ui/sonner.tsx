import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      closeButton
      duration={3000}
      style={{ width: "320px" } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-3 group-[.toaster]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
          success:
            "group-[.toaster]:!bg-[#2a9d4a] group-[.toaster]:!text-white group-[.toaster]:!border-[#2a9d4a] group-[.toaster]:rounded-lg [&_[data-close-button]]:!bg-[#2a9d4a] [&_[data-close-button]]:!text-white [&_[data-close-button]]:!border-white/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
