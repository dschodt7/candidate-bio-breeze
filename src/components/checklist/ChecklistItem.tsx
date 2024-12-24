import { CheckSquare, Square } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SubItem {
  label: string;
  isComplete: boolean;
}

interface ChecklistItemProps {
  label: string;
  isComplete: boolean;
  icon: LucideIcon;
  subItems?: SubItem[];
}

export const ChecklistItem = ({ label, isComplete, icon: Icon, subItems }: ChecklistItemProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        {isComplete ? (
          <CheckSquare className="h-5 w-5 text-green-500" />
        ) : (
          <Square className="h-5 w-5 text-gray-300" />
        )}
        <Icon className="h-4 w-4 text-gray-500" />
        <span className={isComplete ? "text-gray-900" : "text-gray-500"}>
          {label}
        </span>
      </div>
      {subItems && (
        <div className="ml-8 space-y-2">
          {subItems.map((subItem, index) => (
            <div key={index} className="flex items-center space-x-3">
              {subItem.isComplete ? (
                <CheckSquare className="h-4 w-4 text-green-500" />
              ) : (
                <Square className="h-4 w-4 text-gray-300" />
              )}
              <span className={subItem.isComplete ? "text-gray-900" : "text-gray-500"}>
                {subItem.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};