import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '@/shared/constants/theme';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

/** Constrain intrinsic input width; keep ordinary inputs at 16px on mobile web. */
export function AppInput({ className, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      {...props}
      className={cn(uiClasses.inputBase, className)}
    />
  );
}
