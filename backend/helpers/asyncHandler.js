export default (execution) => {
	return async (req, res, next) => {
		try {
			await execution(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};
