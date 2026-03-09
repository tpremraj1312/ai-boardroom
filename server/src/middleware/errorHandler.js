export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    // Never expose internal error details in production
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'An internal server error occurred.'
        : err.message;
    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
