export default function labelizeReviewType(reviewType) {
  switch (reviewType) {
    case "all":
      return "Multi Approval";
    case "single":
      return "Single Approval";
    default:
      return reviewType; // Or some default icon if needed
  }
}
