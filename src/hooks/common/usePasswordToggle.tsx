import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const usePasswordToggle = () => {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        setVisible((prev) => !prev);
    };

    const Icon = visible ? EyeOff : Eye;
    const inputType = visible ? "text" : "password";

    return { visible, toggleVisibility, Icon, inputType };
};
