interface Props {
  params: { weekId: string };
}

export default function WeekSchedulePage({ params }: Props) {
  return (
    <main>
      <h1>Week Schedule: {params.weekId}</h1>
    </main>
  );
}
