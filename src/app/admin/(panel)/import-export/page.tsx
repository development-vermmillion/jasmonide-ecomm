import ImportExport from "@/components/admin/ImportExport";

export default function Page() {
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Import / export</h1><p className="text-sm text-neutral-500">Move products and data in and out with CSV files — great for adding many products at once.</p></div>
      <ImportExport />
    </div>
  );
}
