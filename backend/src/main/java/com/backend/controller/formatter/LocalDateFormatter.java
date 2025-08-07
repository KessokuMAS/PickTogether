package com.backend.controller.formatter;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.format.Formatter;
import org.springframework.lang.NonNull;


public class LocalDateFormatter implements Formatter<LocalDate> {

  @Override
  public LocalDate parse( String text,  Locale locale) {
      return LocalDate.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
  }
  
  @Override
  @NonNull
  public String print(LocalDate object,  Locale locale) {
      return DateTimeFormatter.ofPattern("yyyy-MM-dd").format(object);
  }
}