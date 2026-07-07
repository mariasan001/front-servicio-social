import { toast } from "sonner";

type NotifyOptions = {
  description?: string;
  duration?: number;
};

function show(
  type: "success" | "error" | "warning" | "info",
  title: string,
  options?: NotifyOptions,
) {
  const toastFn = toast[type];
  toastFn(title, {
    description: options?.description,
    duration: options?.duration ?? (type === "error" ? 6000 : 4500),
  });
}

export const notify = {
  success(title: string, options?: NotifyOptions) {
    show("success", title, options);
  },
  error(title: string, options?: NotifyOptions) {
    show("error", title, options);
  },
  warning(title: string, options?: NotifyOptions) {
    show("warning", title, options);
  },
  info(title: string, options?: NotifyOptions) {
    show("info", title, options);
  },
  fromActionFailure(error: string, options?: NotifyOptions) {
    show("error", error, options);
  },
};
