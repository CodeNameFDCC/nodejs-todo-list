import Joi from "joi";

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});

const user = {
  name: null,
};

try {
  const validation = await schema.validateAsync(user);

  console.log("valid data!");
} catch (error) {
  console.log(error.message);
}
