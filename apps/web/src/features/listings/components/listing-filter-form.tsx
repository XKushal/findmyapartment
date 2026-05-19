import { type ListingQueryInput } from "@/features/listings/schemas";

export const LISTING_FILTER_FORM_ID = "listing-filter-form";

type ListingFilterFormProps = {
  filters: ListingQueryInput;
};

function value(value: string | number | undefined) {
  return value === undefined ? "" : String(value);
}

function filterFormKey(filters: ListingQueryInput) {
  return [
    value(filters.rentMin),
    value(filters.rentMax),
    filters.type ?? "",
    value(filters.bedroomsMin),
    value(filters.bathroomsMin),
    filters.availableBy ?? "",
    filters.petPolicy ?? "",
  ].join("|");
}

export function ListingFilterForm({ filters }: ListingFilterFormProps) {
  return (
    <form
      key={filterFormKey(filters)}
      id={LISTING_FILTER_FORM_ID}
      action="/listings"
      className="mb-8 grid gap-4 rounded-md border border-zinc-200 p-4"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor="rentMin" className="text-sm font-medium text-zinc-800">
            Min price
          </label>
          <input
            id="rentMin"
            name="rentMin"
            type="number"
            min="0"
            step="1"
            defaultValue={value(filters.rentMin)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="700"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="rentMax" className="text-sm font-medium text-zinc-800">
            Max price
          </label>
          <input
            id="rentMax"
            name="rentMax"
            type="number"
            min="0"
            step="1"
            defaultValue={value(filters.rentMax)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="1200"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="type" className="text-sm font-medium text-zinc-800">
            Home type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          >
            <option value="">Any type</option>
            <option value="APARTMENT">Apartment</option>
            <option value="ROOM">Room</option>
            <option value="ROOMMATE">Roommate lead</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="grid gap-2">
          <label
            htmlFor="bedroomsMin"
            className="text-sm font-medium text-zinc-800"
          >
            Beds
          </label>
          <input
            id="bedroomsMin"
            name="bedroomsMin"
            type="number"
            min="0"
            step="1"
            defaultValue={value(filters.bedroomsMin)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="1"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="bathroomsMin"
            className="text-sm font-medium text-zinc-800"
          >
            Baths
          </label>
          <input
            id="bathroomsMin"
            name="bathroomsMin"
            type="number"
            min="0"
            step="0.5"
            defaultValue={value(filters.bathroomsMin)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="1"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="availableBy"
            className="text-sm font-medium text-zinc-800"
          >
            Move-in by
          </label>
          <input
            id="availableBy"
            name="availableBy"
            type="date"
            defaultValue={filters.availableBy ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="petPolicy"
            className="text-sm font-medium text-zinc-800"
          >
            Pet policy
          </label>
          <select
            id="petPolicy"
            name="petPolicy"
            defaultValue={filters.petPolicy ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          >
            <option value="">Any policy</option>
            <option value="PETS_ALLOWED">Pets allowed</option>
            <option value="CATS_ONLY">Cats only</option>
            <option value="DOGS_ONLY">Dogs only</option>
            <option value="NO_PETS">No pets</option>
            <option value="UNKNOWN">Not specified</option>
          </select>
        </div>
      </div>
    </form>
  );
}
