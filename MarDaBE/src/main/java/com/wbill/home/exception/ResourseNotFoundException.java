
package com.wbill.home.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourseNotFoundException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public ResourseNotFoundException() {
        super();
    }

    public ResourseNotFoundException(String message) {
        super(message);
    }

    public ResourseNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}