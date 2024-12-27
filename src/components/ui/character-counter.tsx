interface CharacterCounterProps {
  current: number;
  max: number;
}

export const CharacterCounter = ({ current, max }: CharacterCounterProps) => {
  return (
    <div className="text-sm text-muted-foreground text-right">
      {current}/{max} characters
    </div>
  );
};