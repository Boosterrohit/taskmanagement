import Layout from "@/components/taskContext/Layout";
import MyTask from "./myTask";
import AllTasks from "./allTasks";

const TaskManagement = () => {
  return (
    <Layout>
      <MyTask/>
      <AllTasks/>
    </Layout>
  );
};

export default TaskManagement;
