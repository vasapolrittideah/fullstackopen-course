const Header = () => <h1>Web development curriculum</h1>;

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
);

const Content = ({ course }) => {
  const calculateTotalExercises = (parts) => {
    return parts.reduce(
      (accumulator, currentValue) => accumulator + currentValue.exercises,
      0
    );
  };

  return (
    <div>
      <h2>{course.name}</h2>
      {course.parts.map((part) => (
        <Part key={part.id} part={part} />
      ))}
      <strong>
        total of {calculateTotalExercises(course.parts)} exercises
      </strong>
    </div>
  );
};

const Courses = ({ courses }) => {
  return (
    <div>
      <Header />
      {courses.map((course) => (
        <Content key={course.id} course={course} />
      ))}
    </div>
  );
};

export default Courses;
