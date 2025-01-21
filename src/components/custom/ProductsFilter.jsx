import { Search, Barcode, AlertCircle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";

export default function ProductFilters({
  searchQuery = "",
  onSearchChange,
  categoryFilter = "all",
  onCategoryChange,
  gradeFilter = "all",
  onGradeChange,
  sortBy = "name",
  onSortByChange,
  sortOrder = "asc",
  onSortOrderChange,
  categories = [],
  barcodeError = null,
}) {
  const clearfilter = () => {
    onSearchChange("");
    onCategoryChange("all");
    onGradeChange("all");
    onSortByChange("name");
    onSortOrderChange("asc");
  };
  return (
    <div className="mb-8 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
            <Search className="h-5 w-5" />
            <Barcode className="h-5 w-5" />
          </div>
          <div className="flex">
            <Input
              type="text"
              placeholder="Search by product name, brand, or barcode"
              value={searchQuery}
              onChange={e=>onSearchChange(e.target.value??"")}
              className="pl-16 w-full h-[42px] bg-gray-50/50 border-gray-200 focus:border-blue-500 rounded-xl"
            />
            <TooltipProvider>
              <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={clearfilter}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400 "
                >
                  <X className="w-6 h-6" />
                </button>
              </TooltipTrigger>
                <TooltipContent side={"top"} align={"center"}>
                  <p>Remove all filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {barcodeError && (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {barcodeError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full h-[42px] bg-gray-50/50 border-gray-200 rounded-xl">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.products})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={onGradeChange}>
            <SelectTrigger className="w-full h-[42px] bg-gray-50/50 border-gray-200 rounded-xl">
              <SelectValue placeholder="Filter by Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="a">Grade A</SelectItem>
              <SelectItem value="b">Grade B</SelectItem>
              <SelectItem value="c">Grade C</SelectItem>
              <SelectItem value="d">Grade D</SelectItem>
              <SelectItem value="e">Grade E</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full h-[42px] bg-gray-50/50 border-gray-200 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="grade">Nutrition Grade</SelectItem>
              <SelectItem value="energy">Energy Content</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-full h-[42px] bg-gray-50/50 border-gray-200 rounded-xl">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
