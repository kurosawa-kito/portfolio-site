const handleAllDayChange = (event) => {
  setIsAllDay(event.target.checked);
  if (event.target.checked) {
    setSelectedTime(null); // 時間をリセット
  }
};

return (
  <div>
    <label>
      <input type="checkbox" checked={isAllDay} onChange={handleAllDayChange} />
      終日
    </label>
    {!isAllDay && (
      <TimePicker value={selectedTime} onChange={setSelectedTime} />
    )}
  </div>
);
