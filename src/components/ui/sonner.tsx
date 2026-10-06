import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      offset={{ top: 76, right: 16 }}
      mobileOffset={{ top: 72, right: 12, left: 12 }}
      closeButton
      style={{ width: "340px" } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!rounded-xl group-[.toaster]:!border group-[.toaster]:!border-border/70 group-[.toaster]:!bg-popover group-[.toaster]:!text-popover-foreground group-[.toaster]:!shadow-card group-[.toaster]:!px-4 group-[.toaster]:!py-3 group-[.toaster]:!text-sm group-[.toaster]:!gap-3",
          title: "group-[.toast]:!font-medium",
          description: "group-[.toast]:!text-muted-foreground group-[.toast]:text-xs",
          success: "[&_[data-icon]]:!text-success",
          error: "[&_[data-icon]]:!text-destructive",
          warning: "[&_[data-icon]]:!text-warning",
          info: "[&_[data-icon]]:!text-info",
          actionButton:
            "group-[.toast]:!h-auto group-[.toast]:!rounded-lg group-[.toast]:!bg-primary group-[.toast]:!px-3 group-[.toast]:!py-1.5 group-[.toast]:!text-xs group-[.toast]:!font-semibold group-[.toast]:!text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:!bg-popover group-[.toast]:!text-muted-foreground group-[.toast]:!border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
