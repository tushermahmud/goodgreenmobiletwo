export class RC {
    public static respCodeObject = {
        200: 'Saved Successfully.',
        201: 'Saved Successfully.',
        400: 'Error Occurred.',
        401: 'authorization Failed.',
        402: 'Error Occurred.',
        403: 'Error Occurred.',
        404: 'Not Found.',
        500: 'Internal Server Error.',
        10001: 'Invalid info.',
    };

    public static n(code) {
        return this.respCodeObject[code] ?
         this.respCodeObject[code] : 'Oops, there seems to be a service issue, please try again in a while';
    };
}
