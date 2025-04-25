import colors from "colors";

const colorsStyles = {
	error: colors.red.bold,
	warning: colors.yellow,
	success: colors.green,
	info: colors.blue,
	debug: colors.gray,
};

const colorsUtils = {
	log: (type, message) => {
		switch (type) {
			case "error":
				console.error(colorsStyles.error(message));
				break;
			case "warning":
				console.warn(colorsStyles.warning(message));
				break;
			case "success":
				console.log(colorsStyles.success(message));
				break;
			case "info":
				console.log(colorsStyles.info(message));
				break;
			case "debug":
				console.log(colorsStyles.debug(message));
				break;
			default:
				console.log(message);
				break;
		}
	},
};

export default colorsUtils;
