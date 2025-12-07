export default function formatAvatarGroupTooltip(members) {
  const names = members?.map(
    (member) => member.user.first_name + " " + member.user.last_name,
  );
  const displayedNames = names?.slice(0, 3).join(", ");
  const remainingCount = names?.length - 3;
  const tooltipLabel =
    remainingCount > 0
      ? `${displayedNames}, and ${remainingCount} more`
      : displayedNames;
  return tooltipLabel;
}
