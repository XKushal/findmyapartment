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

export function ListingFilterForm({ filters }: ListingFilterFormProps) {
  return (
    <form
      key={filterFormKey(filters)}
      id={LISTING_FILTER_FORM_ID}
      action="/listings"
      className="mb-8 grid gap-5 rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6"
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
  );
}
