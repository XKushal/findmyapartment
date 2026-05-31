import { type ListingQueryInput } from "@/features/listings/schemas";
import { fieldInput, fieldLabel, fieldSelect } from "@/features/ui/field";

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

function hasActiveFilters(filters: ListingQueryInput) {
  return Object.values(filters).some((filterValue) => filterValue !== undefined);
}

export function ListingFilterForm({ filters }: ListingFilterFormProps) {
  return (
    <div
      key={filterFormKey(filters)}
      className="mb-8 rounded-2xl border border-stone-200/80 bg-surface shadow-[var(--shadow-soft)]"
    >
      <input
        id="listing-filter-toggle"
        type="checkbox"
        className="peer sr-only"
        defaultChecked={hasActiveFilters(filters)}
        aria-label="Show listing filters"
      />
      <label
        htmlFor="listing-filter-toggle"
        className="flex cursor-pointer items-center justify-between gap-4 p-5 text-sm font-semibold text-stone-950 md:hidden"
      >
        <span>Filters</span>
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
          Rent · type · move-in
        </span>
      </label>
      <form
        id={LISTING_FILTER_FORM_ID}
        action="/listings"
        className="hidden gap-5 border-t border-stone-100 p-5 peer-checked:grid md:grid md:border-t-0 sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label htmlFor="rentMin" className={fieldLabel()}>
              Min price
            </label>
            <input
              id="rentMin"
              name="rentMin"
              type="number"
              min="0"
              step="1"
              defaultValue={value(filters.rentMin)}
              className={fieldInput()}
              placeholder="700"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="rentMax" className={fieldLabel()}>
              Max price
            </label>
            <input
              id="rentMax"
              name="rentMax"
              type="number"
              min="0"
              step="1"
              defaultValue={value(filters.rentMax)}
              className={fieldInput()}
              placeholder="1200"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className={fieldLabel()}>
              Home type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={filters.type ?? ""}
              className={fieldSelect()}
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
            <label htmlFor="bedroomsMin" className={fieldLabel()}>
              Beds
            </label>
            <input
              id="bedroomsMin"
              name="bedroomsMin"
              type="number"
              min="0"
              step="1"
              defaultValue={value(filters.bedroomsMin)}
              className={fieldInput()}
              placeholder="1"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="bathroomsMin" className={fieldLabel()}>
              Baths
            </label>
            <input
              id="bathroomsMin"
              name="bathroomsMin"
              type="number"
              min="0"
              step="0.5"
              defaultValue={value(filters.bathroomsMin)}
              className={fieldInput()}
              placeholder="1"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="availableBy" className={fieldLabel()}>
              Move-in by
            </label>
            <input
              id="availableBy"
              name="availableBy"
              type="date"
              defaultValue={filters.availableBy ?? ""}
              className={fieldInput()}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="petPolicy" className={fieldLabel()}>
              Pet policy
            </label>
            <select
              id="petPolicy"
              name="petPolicy"
              defaultValue={filters.petPolicy ?? ""}
              className={fieldSelect()}
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
    </div>
  );
}
