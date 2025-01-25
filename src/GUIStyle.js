export class GuiStyler {
    static applyStyle(folder, backgroundColor, hoverColor, textColor = "#000", hoverTextColor = "#000") {
        const domElement = folder.domElement;

        // Apply base styles to the folder
        domElement.style.backgroundColor = backgroundColor;
        domElement.style.color = textColor;
        domElement.style.borderRadius = "8px"; // Add rounded corners
        domElement.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)"; // Add subtle shadow
        domElement.style.padding = "5px"; // Add some padding
        domElement.style.transition = "all 0.3s ease-in-out"; // Smooth transition for hover effects

        // Add hover effects
        domElement.addEventListener("mouseover", () => {
            domElement.style.backgroundColor = hoverColor;
            domElement.style.color = hoverTextColor;
            domElement.style.transform = "scale(1.02)"; // Slight zoom effect
        });

        domElement.addEventListener("mouseout", () => {
            domElement.style.backgroundColor = backgroundColor;
            domElement.style.color = textColor;
            domElement.style.transform = "scale(1.0)"; // Reset zoom effect
        });
    }

    static applyStyleRecursively(folder, backgroundColor, hoverColor, textColor, hoverTextColor) {
        // Apply style to the current folder
        GuiStyler.applyStyle(folder, backgroundColor, hoverColor, textColor, hoverTextColor);

        // Recursively apply styles to nested folders
        if (folder.folders && typeof folder.folders === "object") {
            Object.values(folder.folders).forEach((subfolder) => {
                GuiStyler.applyStyleRecursively(subfolder, backgroundColor, hoverColor, textColor, hoverTextColor);
            });
        }
    }

    static styleExistingFolders(gui) {
        gui.folders.forEach((folder) => {
            const folderTitle = folder.domElement.querySelector(".title")?.textContent || "";
            console.log(`Styling folder: ${folderTitle}`);

            switch (folderTitle) {
                case "Spotlight 1":
                    GuiStyler.applyStyleRecursively(folder, "#C6E2FF", "#A8D4FF", "#232A3E", "#121A28"); // Soft and refreshing light blue
                    break;
                case "Spotlight 2":
                    GuiStyler.applyStyleRecursively(folder, "#C6FFF1", "#A8FFE4", "#233A3A", "#121E1E"); // Gentle and pale mint green
                    break;
                case "Model":
                    GuiStyler.applyStyleRecursively(folder, "#D1DEFF", "#B3C8FF", "#242C3F", "#131822"); // Elegant and soft purple-blue
                    break;
                case "Subsurface Scattering":
                    GuiStyler.applyStyleRecursively(folder, "#C6EEFF", "#A8E4FF", "#233340", "#121B26"); // Subtle and light sky blue
                    break;
                default:
                    console.log(`No specific style applied for folder: ${folderTitle}`);
            }
        
                               
        });
    }
}

