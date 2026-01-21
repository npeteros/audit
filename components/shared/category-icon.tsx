import { icons, LucideProps } from 'lucide-react';

interface CategoryIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

export function CategoryIcon({ name, size = 24, ...props }: CategoryIconProps) {
  const LucideIcon = icons[name as keyof typeof icons];
  
  if (!LucideIcon) {
    return <icons.CircleQuestionMark size={size} {...props} />;
  }
  
  return <LucideIcon size={size} {...props} />;
}