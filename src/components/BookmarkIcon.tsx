import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import { useBookmarksContext } from "../lib/hooks";

type BookmarkIconProps = {
  id: number;
};

export default function BookmarkIcon({ id }: BookmarkIconProps) {
  const { bookmarkedIds, handleToggleBookmark } = useBookmarksContext();

  return (
    <button
      onClick={(e) => {
        handleToggleBookmark(id);
        e.stopPropagation(); //stop the event from bubbling up to the parent element
        e.preventDefault(); //prevent the default behavior of the event
      }}
      className="bookmark-btn"
    >
      <BookmarkFilledIcon
        className={`
        ${bookmarkedIds.includes(id) ? "filled" : ""}
      `}
      />
    </button>
  );
}
